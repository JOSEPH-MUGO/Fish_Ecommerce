//server/prisma/seed.js
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seed...")

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12)

  const admin = await prisma.user.upsert({
    where: { email: "admin@fishstore.com" },
    update: {},
    create: {
      email: "admin@fishstore.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  })

  console.log("✅ Admin user created:", admin.email)

  // Create categories
  const categories = [
    {
      name: "Fresh Fish",
      description: "Daily fresh catch from local waters",
      image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
    },
    {
      name: "Salmon",
      description: "Premium Atlantic and Pacific salmon",
      image: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=400",
    },
    {
      name: "Shellfish",
      description: "Fresh crabs, lobsters, and shrimp",
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=400",
    },
    {
      name: "Tuna",
      description: "High-quality tuna varieties",
      image: "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
    },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    createdCategories.push(created)
    console.log("✅ Category created:", created.name)
  }

  // Create products
  const products = [
    {
      name: "Atlantic Salmon Fillet",
      description: "Fresh Atlantic salmon fillet, perfect for grilling or baking. Rich in omega-3 fatty acids.",
      price: 24.99,
      stock: 50,
      weight: 1.0,
      origin: "Atlantic Ocean",
      featured: true,
      images: ["https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Salmon").id,
    },
    {
      name: "Fresh Red Snapper",
      description: "Whole fresh red snapper, caught daily. Perfect for whole fish preparations.",
      price: 18.5,
      stock: 30,
      weight: 2.5,
      origin: "Gulf of Mexico",
      featured: true,
      images: ["https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Fresh Fish").id,
    },
    {
      name: "King Crab Legs",
      description: "Premium Alaskan king crab legs. Sweet and tender meat.",
      price: 45.99,
      stock: 20,
      weight: 1.5,
      origin: "Alaska",
      featured: true,
      images: ["https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Shellfish").id,
    },
    {
      name: "Yellowfin Tuna Steak",
      description: "Sushi-grade yellowfin tuna steaks. Perfect for searing or sashimi.",
      price: 32.99,
      stock: 25,
      weight: 0.8,
      origin: "Pacific Ocean",
      featured: false,
      images: ["https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Tuna").id,
    },
    {
      name: "Fresh Lobster",
      description: "Live Maine lobster, approximately 1.5-2 lbs each.",
      price: 28.99,
      stock: 15,
      weight: 1.75,
      origin: "Maine",
      featured: false,
      images: ["https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Shellfish").id,
    },
    {
      name: "Sea Bass Fillet",
      description: "Chilean sea bass fillet, buttery and flaky texture.",
      price: 29.99,
      stock: 35,
      weight: 1.2,
      origin: "Chile",
      featured: false,
      images: ["https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=800"],
      categoryId: createdCategories.find((c) => c.name === "Fresh Fish").id,
    },
  ]

  for (const product of products) {
    const created = await prisma.product.create({
      data: product,
    })
    console.log("✅ Product created:", created.name)
  }

  console.log("🎉 Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
