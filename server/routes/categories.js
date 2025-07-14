// File: server/routes/categories.js
const express = require("express")
const { prisma } = require("../config/database")

const router = express.Router()

// Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: {
              where: {
                active: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    res.json(categories)
  } catch (error) {
    console.error("Get categories error:", error)
    res.status(500).json({ message: "Error fetching categories" })
  }
})

// Get single category
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          where: {
            active: true,
          },
          take: 12,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    if (!category) {
      return res.status(404).json({ message: "Category not found" })
    }

    res.json(category)
  } catch (error) {
    console.error("Get category error:", error)
    res.status(500).json({ message: "Error fetching category" })
  }
})

module.exports = router
