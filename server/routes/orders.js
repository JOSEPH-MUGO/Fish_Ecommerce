// File: server/routes/orders.js
const express = require("express");
const { prisma } = require("../config/database");
const { auth } = require("../middleware/auth");
const { validateOrder } = require("../middleware/validation");

const router = express.Router();

// Generate unique order number
const generateOrderNumber = async () => {
  let orderNumber;
  let isUnique = false;

  while (!isUnique) {
    orderNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    const existing = await prisma.order.findUnique({
      where: { orderNumber },
    });
    if (!existing) {
      isUnique = true;
    }
  }

  return orderNumber;
};

// Create order
router.post("/", validateOrder, async (req, res) => {
  try {
    const {
      items,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      notes,
      userId,
    } = req.body;

    // Calculate total and validate products
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || !product.active) {
        return res
          .status(400)
          .json({ message: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Insufficient stock for ${product.name}` });
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        total,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        notes,
        orderItems: {
          create: orderItems,
        },
      },
      include: {
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

    // Update product stock
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Error creating order" });
  }
});

// Get user orders
router.get("/my-orders", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: req.user.id },
        include: {
          orderItems: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  images: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        skip,
        take: Number.parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId: req.user.id } }),
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
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get single order
router.get("/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                images: true,
                price: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ message: "Error fetching order" });
  }
});

module.exports = router;
