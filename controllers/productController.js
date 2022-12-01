const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.userId;
  const product = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product });
};
const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ products, count: products.length });
};
const getSingleProduct = async (req, res) => {
  const { id: procductId } = req.params;
  const product = await Product.findOne({ _id: procductId }).populate(
    "reviews"
  );
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${procductId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const updateProduct = async (req, res) => {
  const { id: procductId } = req.params;
  const product = await Product.findOneAndUpdate(
    { _id: procductId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${procductId}`);
  }
  res.status(StatusCodes.OK).json({ product });
};
const deleteProduct = async (req, res) => {
  const { id: procductId } = req.params;
  const product = await Product.findOne({ _id: procductId });
  if (!product) {
    throw new CustomError.NotFoundError(`No product with id: ${procductId}`);
  }
  await product.remove();
  res.status(StatusCodes.OK).json({ msg: "Success! Product removed" });
};
const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No File Upload");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Please Upload Image");
  }
  const maxsSize = 1024 * 1024;
  if (productImage.size > maxsSize) {
    throw new CustomError.BadRequestError(
      "Please upload image smaller thatn 1MB"
    );
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + `${productImage.name}`
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
