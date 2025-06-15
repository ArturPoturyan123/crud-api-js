const Product = require("./../models/product.model.js");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}); // Վերցնում է բոլոր տվյալները
    res.json(products); // Վերադարձնում է որպես JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await Product.findById(id); // Վերցնում է բոլոր տվյալները
    res.status(200).json(products); // Վերադարձնում է որպես JSON
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createdProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      { new: true } // վերադարձնում է թարմացված տարբերակը
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "The product is not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
   getProducts,
  getProduct,
  createdProduct,
  updateProduct,
  deleteProduct
};
