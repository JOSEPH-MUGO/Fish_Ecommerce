// client/src/pages/AdminDashboard.js
"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiEye,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTrendingUp,
  FiX,
  FiMenu,
  FiTag,
  FiHome,
  FiLogOut,
  FiSearch,
} from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import ImageUpload from "../components/ImageUpload";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Search states
  const [searchRecentOrders, setSearchRecentOrders] = useState("");
  const [searchProducts, setSearchProducts] = useState("");
  const [searchOrders, setSearchOrders] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [productFilter, setProductFilter] = useState("all");

  // Product form state
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    stock: "",
    isFeatured: false,
    active: true,
    isWeekendOffer: false,
    isSustainable: false,
    mainImage: null,
  });

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset search when switching tabs
  useEffect(() => {
    setSearchRecentOrders("");
    setSearchProducts("");
    setSearchOrders("");
    setSearchUsers("");
  }, [activeTab]);

  // Reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchOrders]);

  // Category management states
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryName, setCategoryName] = useState("");

  const openCategoryModal = (cat = null) => {
    if (cat) {
      setSelectedCategory(cat);
      setCategoryName(cat.name);
    } else {
      setSelectedCategory(null);
      setCategoryName("");
    }
    setShowCategoryModal(true);
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/admin/categories/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Category deleted");
      // refresh list:
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/categories`
      );
      setCategories(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // 3) Submit handler for create/update:
  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (selectedCategory) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/admin/categories/${selectedCategory.id}`,
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Category updated");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/categories`,
          { name: categoryName },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Category created");
      }
      // reload
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/categories`
      );
      setCategories(data);
      setShowCategoryModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save category");
    }
  };

  useEffect(() => {
    // pull categories once
    const loadCategories = async () => {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/categories`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCategories(data);
    };
    loadCategories();
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [productsRes, ordersRes, usersRes, statsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/admin/products`, {
          params: {
            limit: 100, // Get all products for filtering
            active:
              productFilter === "all" ? undefined : productFilter === "active",
          },
          headers,
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/orders`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/users`, { headers }),
        axios.get(`${process.env.REACT_APP_API_URL}/admin/stats`, { headers }),
      ]);

      setProducts(
        Array.isArray(productsRes.data)
          ? productsRes.data
          : productsRes.data.products || []
      );
      setOrders(
        Array.isArray(ordersRes.data)
          ? ordersRes.data
          : ordersRes.data.orders || []
      );
      setUsers(
        Array.isArray(usersRes.data)
          ? usersRes.data
          : Array.isArray(usersRes.data.users)
          ? usersRes.data.users
          : []
      );
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  }, [productFilter]);

  useEffect(() => {
    if (activeTab === "products") {
      fetchData();
    }
  }, [activeTab, productFilter, fetchData]);

  // Filter functions
  const filterRecentOrders = (orders) => {
    if (!searchRecentOrders) return orders.slice(0, 5);

    return orders
      .filter(
        (order) =>
          order.orderNumber.toString().includes(searchRecentOrders) ||
          (order.user?.firstName || "Guest")
            .toLowerCase()
            .includes(searchRecentOrders.toLowerCase()) ||
          order.status
            .toLowerCase()
            .includes(searchRecentOrders.toLowerCase()) ||
          new Date(order.createdAt)
            .toLocaleDateString()
            .includes(searchRecentOrders)
      )
      .slice(0, 5);
  };

  const filterProducts = (products) => {
    if (!searchProducts) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchProducts.toLowerCase()) ||
        (product.category?.name || "")
          .toLowerCase()
          .includes(searchProducts.toLowerCase()) ||
        product.price.toString().includes(searchProducts) ||
        product.stock.toString().includes(searchProducts)
    );
  };

  const filterOrders = (orders) => {
    if (!searchOrders) return orders;

    return orders.filter(
      (order) =>
        order.orderNumber.toString().includes(searchOrders) ||
        (order.user?.name || "Guest")
          .toLowerCase()
          .includes(searchOrders.toLowerCase()) ||
        order.status.toLowerCase().includes(searchOrders.toLowerCase()) ||
        new Date(order.createdAt).toLocaleDateString().includes(searchOrders) ||
        order.total.toString().includes(searchOrders)
    );
  };

  const filterUsers = (users) => {
    if (!searchUsers) return users;

    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.email.toLowerCase().includes(searchUsers.toLowerCase()) ||
        user.role.toLowerCase().includes(searchUsers.toLowerCase()) ||
        new Date(user.createdAt).toLocaleDateString().includes(searchUsers)
    );
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const productData = {
        name: productForm.name,
        description: productForm.description,
        price: Number.parseFloat(productForm.price),
        stock: Number.parseInt(productForm.stock, 10),
        categoryId: productForm.categoryId,
        featured: productForm.isFeatured,
        active: productForm.active,
        isWeekendOffer: productForm.isWeekendOffer,
        isSustainable: productForm.isSustainable,
        image: productForm.mainImage?.url || "",
      };

      if (selectedProduct) {
        await axios.put(
          `${process.env.REACT_APP_API_URL}/admin/products/${selectedProduct.id}`,
          productData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Product updated successfully");
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/admin/products`,
          productData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Product created successfully");
      }

      setShowProductModal(false);
      setSelectedProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        isFeatured: false,
        active: true,
        isWeekendOffer: false,
        isSustainable: false,
        mainImage: null,
      });
      fetchData();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/admin/products/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        toast.success("Product deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Failed to delete product");
      }
    }
  };

  const openProductModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setProductForm({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        categoryId: product.categoryId,
        stock: product.stock.toString(),
        isFeatured: product.featured || false,
        active: product.active,
        isWeekendOffer: product.isWeekendOffer,
        isSustainable: product.isSustainable,
        mainImage: product.images ? { url: product.images } : null,
      });
    } else {
      setSelectedProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        categoryId: "",
        stock: "",
        isFeatured: false,
        active: true,
        isWeekendOffer: false,
        isSustainable: false,
        mainImage: null,
      });
    }
    setShowProductModal(true);
  };

  const handleMainImageUpload = (image) => {
    setProductForm((prev) => ({ ...prev, mainImage: image }));
  };

  // Get filtered data
  const filteredRecentOrders = filterRecentOrders(orders);
  const filteredProducts = filterProducts(products);
  const filteredOrders = filterOrders(orders);
  const filteredUsers = filterUsers(users);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      // your PUT endpoint to update status
      await axios.put(
        `${process.env.REACT_APP_API_URL}/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Reflect change in the modal
      setSelectedOrder((prev) => ({ ...prev, status: newStatus }));

      // Also update it in your main orders list
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      toast.success("Order status updated");
    } catch (err) {
      console.error("Error updating status", err);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-gray-800 text-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center space-x-2">
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
              <h1 className="text-xl font-bold">FishMarket</h1>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-700"
          >
            <FiMenu className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6">
          {[
            { id: "overview", name: "Overview", icon: FiHome },
            { id: "categories", name: "Categories", icon: FiTag },
            { id: "products", name: "Products", icon: FiShoppingBag },
            { id: "orders", name: "Orders", icon: FiDollarSign },
            { id: "users", name: "Users", icon: FiUsers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center w-full p-4 space-x-3 text-left ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700"
              }`}
            >
              <tab.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{tab.name}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4  border-gray-700">
          <button className="flex items-center space-x-3 text-gray-300 hover:text-white w-full">
            <FiLogOut className="h-5 w-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage your fish Shop</p>
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 p-3 rounded-lg">
                      <FiShoppingBag className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Products
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.totalProducts}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 p-3 rounded-lg">
                      <FiDollarSign className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Orders
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.totalOrders}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-purple-100 p-3 rounded-lg">
                      <FiUsers className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Users
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {stats.totalUsers}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6 border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-orange-100 p-3 rounded-lg">
                      <FiTrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-semibold text-gray-900">
                        KES {stats.totalRevenue?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-white rounded-xl shadow border border-gray-100">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Recent Orders
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search orders..."
                        value={searchRecentOrders}
                        onChange={(e) => setSearchRecentOrders(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <FiSearch className="h-5 w-5" />
                      </div>
                    </div>
                    <button
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      onClick={() => setActiveTab("orders")}
                    >
                      View All
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecentOrders.length > 0 ? (
                        filteredRecentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.customerName || "Guest"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              KES {order.total?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No orders found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
                <button
                  onClick={() => openCategoryModal()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 text-sm"
                >
                  <FiPlus className="h-5 w-5" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          # Products
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {cat.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {cat._count.products}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            <button
                              onClick={() => openCategoryModal(cat)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            >
                              <FiEdit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => deleteCategory(cat.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 ml-2"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Products</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setProductFilter("all")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        productFilter === "all"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setProductFilter("active")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        productFilter === "active"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Active
                    </button>
                    <button
                      onClick={() => setProductFilter("inactive")}
                      className={`px-3 py-1 rounded-lg text-sm ${
                        productFilter === "inactive"
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      Inactive
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchProducts}
                      onChange={(e) => setSearchProducts(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <FiSearch className="h-5 w-5" />
                    </div>
                  </div>
                  <button
                    onClick={() => openProductModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors text-sm"
                  >
                    <FiPlus className="h-5 w-5" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <tr
                            key={product.id}
                            className={`hover:bg-gray-50 ${
                              !product.active ? "bg-gray-100" : ""
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img
                                    className="h-10 w-10 rounded object-cover"
                                    src={
                                      product.images ||
                                      "/placeholder.png?height=40&width=40"
                                    }
                                    alt={product.name}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {product.name}
                                    {product.featured && (
                                      <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                        Featured
                                      </span>
                                    )}
                                    {!product.active && (
                                      <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                                        Inactive
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {product.category?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              KES {product.price?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${
                                  product.stock > 10
                                    ? "bg-green-100 text-green-800"
                                    : product.stock > 0
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {product.stock} in stock
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-right">
                              <button
                                onClick={() => openProductModal(product)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              >
                                <FiEdit className="h-5 w-5" />
                              </button>
                              {product.active && (
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product.id)
                                  }
                                  className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                >
                                  <FiTrash2 className="h-5 w-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No products found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchOrders}
                    onChange={(e) => setSearchOrders(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <FiSearch className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order Number
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.length > 0 ? (
                        currentOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.orderNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {order.customerName || "Guest"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              KES {order.total?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : order.status === "processing"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : order.status === "shipped"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowOrderModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              >
                                <FiEye className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="6"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No orders found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {indexOfFirstItem + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(indexOfLastItem, filteredOrders.length)}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {filteredOrders.length}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() => paginate(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Previous</span>
                            &lt;
                          </button>

                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i + 1}
                              onClick={() => paginate(i + 1)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === i + 1
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}

                          <button
                            onClick={() => paginate(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Next</span>
                            &gt;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Users</h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchUsers}
                    onChange={(e) => setSearchUsers(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <FiSearch className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10" />
                                </div>
                                <div className="ml-4">
                                  <div>{user.firstName} </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="4"
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No users found matching your search
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {selectedProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        categoryId: e.target.value,
                      }))
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) =>
                    setProductForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={productForm.stock}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        stock: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>
                <ImageUpload
                  onImageUpload={handleMainImageUpload}
                  multiple={false}
                  existingImage={productForm.mainImage}
                />
              </div>
              {/* Inside the product modal form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isFeatured}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        isFeatured: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Featured Product</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.active}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        active: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Active</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isWeekendOffer}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        isWeekendOffer: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Weekend Offer</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={productForm.isSustainable}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        isSustainable: e.target.checked,
                      }))
                    }
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">
                    Sustainable Seafood
                  </span>
                </label>
              </div>

              <div className="flex justify-center space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 "
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedProduct ? "Update" : "Create"} Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-xl bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Order Details — #{selectedOrder.orderNumber}
              </h3>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            {/* —— CUSTOMER & ORDER INFO & STATUS —— */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Customer Information
                </h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span>{" "}
                  {selectedOrder.customerName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span>{" "}
                  {selectedOrder.customerEmail}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Phone:</span>{" "}
                  {selectedOrder.customerPhone}
                </p>
              </div>

              {/* Order Info & Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Order Information
                </h4>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Total:</span> KES{" "}
                  {selectedOrder.total.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
                <div className="mt-4">
                  <label className="font-bold block mb-1 text-sm">
                    Update Order Status
                  </label>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) =>
                      updateOrderStatus(selectedOrder.id, e.target.value)
                    }
                    className="w-full border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* —— SHIPPING ADDRESS —— */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">
                Shipping Address
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  {selectedOrder.shippingAddress ||
                    "No shipping address provided"}
                </p>
              </div>
            </div>

            {/* —— ORDER ITEMS —— */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
              <div className="border rounded-lg overflow-hidden">
                {selectedOrder.orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center px-4 py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.product.images || "/placeholder.png"}
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      KES {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              {selectedCategory ? "Edit Category" : "New Category"}
            </h3>
            <form onSubmit={handleCategorySubmit}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                className="w-full border px-3 py-2 rounded mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
