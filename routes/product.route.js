const express = require("express");
const Product = require("../models/product.model.js");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createdProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller.js");

router.get("/api/products", getProducts);
router.get("/api/products/:id", getProduct);
router.post("/api/products", createdProduct);
router.put("/api/products/:id", updateProduct);
router.delete("/api/products/:id", deleteProduct);

module.exports = router;
