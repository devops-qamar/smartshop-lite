const Product = require('../models/Product');

/**
 * GET /api/products
 * Supports query params:
 *   search   - keyword search on name/description
 *   category - exact category filter
 *   minPrice, maxPrice - price range filter
 *   sort     - "price_asc" | "price_desc" | "newest" (default)
 *   page, limit - pagination
 */
async function getProducts(req, res, next) {
  try {
    const { search, category, minPrice, maxPrice, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);

    const filter = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price_asc') sortOption = { price: 1 };
    if (sort === 'price_desc') sortOption = { price: -1 };
    if (sort === 'name_asc') sortOption = { name: 1 };

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/products/categories - list of distinct categories for the filter dropdown */
async function getCategories(req, res, next) {
  try {
    const categories = await Product.distinct('category');
    res.json(categories.sort());
  } catch (err) {
    next(err);
  }
}

/** GET /api/products/:id */
async function getProductById(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/** POST /api/products (admin only) */
async function createProduct(req, res, next) {
  try {
    const { name, description, price, category, imageUrl, stock, featured } = req.body;
    const product = await Product.create({
      name,
      description,
      price,
      category,
      imageUrl,
      stock,
      featured,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

/** PUT /api/products/:id (admin only) */
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/products/:id (admin only) */
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted', id: req.params.id });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
