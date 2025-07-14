// server/middleware/auth.js
const jwt = require("jsonwebtoken")
const { prisma } = require("../config/database")

// Verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, firstName: true, lastName: true, role: true },
    })

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" })
    }

    req.user = user
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Token is not valid" })
  }
}

// Admin authorization
const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Access denied. Admin required." })
      }
      next()
    })
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" })
  }
}

module.exports = { auth, adminAuth }
