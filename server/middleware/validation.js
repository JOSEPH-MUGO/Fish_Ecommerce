// File: server/middleware/validation.js
const { body, validationResult } = require("express-validator")

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log("Validation Errors:", errors.array());
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}

// User registration validation
const validateRegister = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("firstName").trim().isLength({ min: 2 }).withMessage("First name must be at least 2 characters long"),
  body("lastName").trim().isLength({ min: 2 }).withMessage("Last name must be at least 2 characters long"),
  handleValidationErrors,
]

// User login validation
const validateLogin = [
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
]

// Product validation
const validateProduct = [
  body("name").trim().isLength({ min: 2 }).withMessage("Product name must be at least 2 characters long"),
  body("description").trim().isLength({ min: 10 }).withMessage("Description must be at least 10 characters long"),
  body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
  body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
  body("categoryId").notEmpty().withMessage("Category is required"),
  handleValidationErrors,
]

// Order validation
const validateOrder = [
  body("customerName").trim().isLength({ min: 2 }).withMessage("Customer name is required"),
  body("customerEmail").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("customerPhone").trim().isLength({ min: 10 }).withMessage("Valid phone number is required"),
  body("shippingAddress").trim().isLength({ min: 10 }).withMessage("Shipping address is required"),
  body("items").isArray({ min: 1 }).withMessage("Order must contain at least one item"),
  handleValidationErrors,
]

// Contact form validation
const validateContact = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters long"),
  body("email").isEmail().normalizeEmail().withMessage("Please provide a valid email"),
  body("phone").optional().trim(),
  body("message").trim().isLength({ min: 5 }).withMessage("Message must be at least 10 characters long"),
  handleValidationErrors,
]

module.exports = {
  validateRegister,
  validateLogin,
  validateProduct,
  validateOrder,
  validateContact,
  handleValidationErrors,
}
