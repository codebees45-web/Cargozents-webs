const Product = require("../models/Product");

// GET /api/products
exports.getProducts = async (req, res, next) => {
  try {
    const { category, shipper } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (shipper) filter.shipper = shipper;

    const products = await Product.find(filter)
      .populate("shipper", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/mine
exports.getMyProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      shipper: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("shipper", "name phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/products
exports.createProduct = async (req, res, next) => {
  try {
    if (!["catalog", "both"].includes(req.user.shipperMode)) {
      return res.status(403).json({
        success: false,
        message: "Your account is not set up for catalog selling",
      });
    }

    const product = await Product.create({
      ...req.body,
      shipper: req.user._id,
    });

    await product.populate("shipper", "name phone");

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/products/:id
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        shipper: req.user._id,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    ).populate("shipper", "name phone");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        shipper: req.user._id,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from catalog",
    });
  } catch (err) {
    next(err);
  }
};