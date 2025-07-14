// File: server/routes/admin.js
const express = require("express");
const { prisma } = require("../config/database");
const { adminAuth } = require("../middleware/auth");
const { validateProduct } = require("../middleware/validation");

const router = express.Router();

// Get dashboard stats
router.get("/stats", adminAuth, async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders, totalRevenue, recentOrders] =
      await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { active: true } }),
        prisma.order.count(),
        prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: "CANCELLED" } },
        }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),
      ]);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
});

// Get all users with pagination
router.get("/users", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const where = search
      ? {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
        },
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number.parseInt(limit));

    res.json({
      users,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get all orders with pagination
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                },
              },
            },
          },
        },
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number.parseInt(limit));

    res.json({
      orders,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Update order status
router.put("/orders/:id/status", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
              },
            },
          },
        },
      },
    });

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Error updating order status" });
  }
});

// Get all products for admin
router.get("/products", adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, active } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const where = {};
    if (active === "true" || active === "false") {
      where.active = active === "true";
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (category) where.categoryId = category;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / Number.parseInt(limit));

    res.json({
      products,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number.parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get admin products error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Create product
router.post("/products", adminAuth, validateProduct, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      image,
      weight,
      origin,
      featured,
      active,
      isWeekendOffer,
      isSustainable,
    } = req.body;
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images: image, // single URL string
        weight: weight ? Number(weight) : null,
        origin,
        featured: featured,
        active: active,
        isWeekendOffer: Boolean(isWeekendOffer),
        isSustainable: Boolean(isSustainable),
        category: { connect: { id: categoryId } },
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Error creating product" });
  }
});

// Update product
router.put("/products/:id", adminAuth, validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      images: image,
      weight,
      origin,
      featured,
      active,
      isWeekendOffer,
      isSustainable,
    } = req.body;
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: Number(price),
        stock: Number(stock),
        images: image, // single URL string
        weight: weight ? Number(weight) : null,
        origin,
        featured,
        active,
        isWeekendOffer: Boolean(isWeekendOffer),
        isSustainable: Boolean(isSustainable),
        // update the category relation:
        category: { connect: { id: categoryId } },
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });

    res.json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Error updating product" });
  }
});

// Delete product
router.delete("/products/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Create category
router.post("/categories", adminAuth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = await prisma.category.create({
      data: { name },
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ message: "Error creating category" });
  }
});

// Update category
router.put("/categories/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });

    res.json({
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ message: "Error updating category" });
  }
});

// Delete category
router.delete("/categories/:id", adminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId: id, active: true },
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: "Cannot delete category with active products",
      });
    }

    await prisma.category.delete({
      where: { id },
    });

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ message: "Error deleting category" });
  }
});

module.exports = router;
