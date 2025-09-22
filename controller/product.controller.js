const Product = require('../models/product.Model');

// Test endpoint
const testEndpoint = (req, res) => {
  res.json({ message: 'Backend API is working!', timestamp: new Date().toISOString() });
};

// Create product
const addProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get products with sorting, filtering, pagination
const getProducts = async (req, res) => {
  try {
    const { 
      sortBy, 
      sortOrder, 
      brand, 
      category, 
      minPrice, 
      maxPrice, 
      minNewPrice, 
      maxNewPrice, 
      page = 1, 
      limit = 16 
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Brand filtering (exact match or partial match)
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    // Category filtering (exact match or partial match)
    if (category) {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    // Price range filtering (legacy price field)
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    // New price range filtering
    if (minNewPrice || maxNewPrice) {
      filter.newPrice = {};
      if (minNewPrice) filter.newPrice.$gte = Number(minNewPrice);
      if (maxNewPrice) filter.newPrice.$lte = Number(maxNewPrice);
    }

    // Build sort object
    const sort = {};
    if (sortBy) {
      // Handle special sorting cases
      if (sortBy === 'brand') {
        sort.brand = sortOrder === 'desc' ? -1 : 1;
      } else if (sortBy === 'price') {
        // Sort by newPrice if available, otherwise by price
        sort.newPrice = sortOrder === 'desc' ? -1 : 1;
        sort.price = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      }
    }

    // Calculate pagination 
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit))); // Cap at 100 items per page
    const skip = (pageNum - 1) * limitNum;

    // Get products with pagination
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Product.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    // Get unique brands and categories for filter options
    const brands = await Product.distinct('brand');
    const categories = await Product.distinct('category');

    res.json({ 
      products, 
      total, 
      page: pageNum, 
      totalPages,
      limit: limitNum,
      brands,
      categories,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    console.log('Delete request for product ID:', req.params.id);
    console.log('ID type:', typeof req.params.id);
    console.log('ID length:', req.params.id.length);
    
    // Try to find and delete the product
    const product = await Product.findByIdAndDelete(req.params.id);
    console.log('Product found for deletion:', product);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', deletedProduct: product });
  } catch (err) {
    console.error('Delete product error:', err);
    console.error('Error details:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  testEndpoint,
  addProduct,
  getProducts,
  updateProduct,
  deleteProduct
};
