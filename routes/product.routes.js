const express = require('express');
const router = express.Router();
const productController = require('../controller/product.controller');

// Test endpoint
router.get('/test', productController.testEndpoint);

// Create product
router.post('/add', productController.addProduct);

// Get products with sorting, filtering, pagination
router.get('/', productController.getProducts);

// Update product
router.put('/:id', productController.updateProduct);

// Delete product
router.delete('/:id', productController.deleteProduct);

module.exports = router;
