const { materialModel } = require('../models/materialModel');

module.exports.getAllMaterialsController = async (req, res) => {
  try {
    const materials = await materialModel.find({}).sort({ createdAt: 1 }).lean();
    res.status(200).json({ materials });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getClientMaterialsController = async (req, res) => {
  try {
    const materials = await materialModel.find({}).sort({ createdAt: 1 }).lean();
    res.status(200).json({ materials });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.createMaterialController = async (req, res) => {
  const { label, materialName, category, brand, unit, price, stock } = req.body;
  if (!label || !materialName) return res.status(400).send('label and materialName are required');
  try {
    const material = await materialModel.create({ label, materialName, category, brand, unit, price, stock });
    res.status(200).json({ material });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.updateMaterialController = async (req, res) => {
  const { id, label, materialName, category, brand, unit, price, stock } = req.body;
  if (!id) return res.status(400).send('id is required');
  try {
    const material = await materialModel.findById(id);
    if (!material) return res.status(404).send('Material not found');
    if (label !== undefined) material.label = label;
    if (materialName !== undefined) material.materialName = materialName;
    if (category !== undefined) material.category = category;
    if (brand !== undefined) material.brand = brand;
    if (unit !== undefined) material.unit = unit;
    if (price !== undefined) material.price = price;
    if (stock !== undefined) material.stock = stock;
    await material.save();
    res.status(200).json({ material });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.deleteMaterialController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('id is required');
  try {
    const material = await materialModel.findById(id);
    if (!material) return res.status(404).send('Material not found');
    await materialModel.deleteOne({ _id: id });
    res.status(200).send('Deleted successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};

module.exports.setDefaultMaterialController = async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).send('id is required');
  try {
    const material = await materialModel.findById(id);
    if (!material) return res.status(404).send('Material not found');
    material.isDefault = !material.isDefault;
    await material.save();
    res.status(200).json({ material });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
};
