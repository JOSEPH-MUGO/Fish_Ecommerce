// server/routes/products.js
const express = require("express");
const { prisma } = require("../config/database");

const router = express.Router();


// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      minPrice,
      maxPrice,
      search,
      featured,
      weekendOffer,
      sustainable,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);
    const take = Number.parseInt(limit);

    // Build where clause
    const where = {
      active: true,
    };
    if (weekendOffer === "true") {
      where.isWeekendOffer = true;
    }

    if (sustainable === "true") {
      where.isSustainable = true;
    }

    if (category) {
      where.categoryId = category;
    }

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (featured === "true") {
      where.featured = true;
    }
    

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = Number.parseFloat(minPrice);
      if (maxPrice) where.price.lte = Number.parseFloat(maxPrice);
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

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
        take,
        orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      products,
      pagination: {
        currentPage: Number.parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: take,
        hasNextPage: Number.parseInt(page) < totalPages,
        hasPrevPage: Number.parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!product || !product.active) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Get featured products
router.get("/featured/list", async (req, res) => {
  try {
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
        active: true,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(featuredProducts);
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({ message: "Error fetching featured products" });
  }
});


module.exports = router;
