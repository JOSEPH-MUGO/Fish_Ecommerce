// / File: client/src/pages/Orders.js
"use client";

import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { FaEye, FaTimes, FaSearch } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/orders/my-orders`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerfirstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.customerlastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>My Orders - Ocean Treasures</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-4xl font-bold text-gray-800">My Orders</h1>
            <p className="text-xl text-gray-600 mt-2">
              Track and manage your seafood orders
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">
                No orders found
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                You haven't placed any orders yet.
              </p>
              <a
                href="/shop"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-block"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <>
              {/* Search Bar */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="relative max-w-md">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Total
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentOrders.map((order) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900">
                              #{order.orderNumber}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {formatStatus(order.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-lg font-bold text-gray-900">
                              KES {order.total.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedOrder({
                                  ...order,
                                  items: order.orderItems, // alias to match expected structure
                                });
                                setShowOrderModal(true);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                              <FaEye className="mr-2" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          handlePageChange(Math.max(currentPage - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(
                            Math.min(currentPage + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {indexOfFirstOrder + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(indexOfLastOrder, filteredOrders.length)}
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
                            onClick={() =>
                              handlePageChange(Math.max(currentPage - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            &lt;
                          </button>
                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === currentPage
                                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                          <button
                            onClick={() =>
                              handlePageChange(
                                Math.min(currentPage + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            &gt;
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800">
                  Order Details
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Order Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">
                    Order Information
                  </h4>
                  <div className="space-y-3">
                    <p>
                      <span className="font-semibold">Order ID:</span> #
                      {selectedOrder.orderNumber}
                    </p>
                    <p>
                      <span className="font-semibold">Date:</span>{" "}
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>
                      <span
                        className={`ml-2 inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(
                          selectedOrder.status
                        )}`}
                      >
                        {formatStatus(selectedOrder.status)}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Total:</span>{" "}
                      <span className="text-2xl font-bold text-blue-600">
                        KES {selectedOrder.total.toFixed(2)}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">
                    Customer Information
                  </h4>
                  <div className="space-y-3">
                    <p>
                      <span className="font-semibold">First Name:</span>{" "}
                      {selectedOrder.customerName.split(" ")[0]}
                    </p>

                    <p>
                      <span className="font-semibold">Last Name:</span>{" "}
                      {selectedOrder.customerName.split(" ")[1] || ""}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{" "}
                      {selectedOrder.customerEmail}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span>{" "}
                      {selectedOrder.customerPhone}
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  Delivery Address
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {selectedOrder.shippingAddress}
                </p>
              </div>

              {/* Order Items */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-xl font-bold text-gray-800 mb-4">
                  Order Items
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Product
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id} className="bg-white">
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <img
                                src={item.product.images || "/placeholder.png"}
                                alt={item.product.name}
                                className="w-12 h-12 rounded-lg object-cover mr-4"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {item.product.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {item.product.category.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-4 text-gray-900">
                            KES {item.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-900">
                            KES {(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setShowOrderModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Orders;
