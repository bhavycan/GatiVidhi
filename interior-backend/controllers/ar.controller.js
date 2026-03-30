const cloudinary = require('cloudinary').v2;
const { arDesignModel } = require('../models/arDesignModel');
const uploadToCloudinary = require('../utils/cloudinary.multer');

// For raw uploads, public_id includes the file extension — keep it
const extractRawPublicId = (url) => {
  try {
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return null;
    let startIndex = uploadIndex + 1;
    if (/^v\d+$/.test(parts[startIndex])) startIndex++;
    return parts.slice(startIndex).join('/');
  } catch {
    return null;
  }
};

const deleteFromCloudinary = async (url) => {
  const publicId = extractRawPublicId(url);
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch(() => {});
};

module.exports.uploadArDesignController = async (req, res) => {
  const { projectId, title } = req.body;
  if (!projectId || !title) return res.status(400).send('Project and title are required');
  if (!req.file) return res.status(400).send('GLB file is required');

  try {
    const dataURI = `data:application/octet-stream;base64,${req.file.buffer.toString('base64')}`;
    const result = await uploadToCloudinary(dataURI, `ar-designs/${Date.now()}-${req.file.originalname}`, 'raw');

    const design = await arDesignModel.create({
      projectId,
      title: title.trim(),
      glbUrl: result.secure_url
    });

    res.status(201).json(design);
  } catch (err) {
    console.error('[AR UPLOAD ERROR]', err);
    res.status(500).send('Upload failed');
  }
};

module.exports.getArDesignsByProjectController = async (req, res) => {
  const { projectId } = req.params;
  try {
    const designs = await arDesignModel.find({ projectId }).sort({ createdAt: -1 });
    res.json(designs);
  } catch (err) {
    res.status(500).send('Failed to fetch AR designs');
  }
};

module.exports.replaceArDesignController = async (req, res) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).send('GLB file is required');

  try {
    const design = await arDesignModel.findById(id);
    if (!design) return res.status(404).send('Design not found');

    // Delete old file from Cloudinary
    await deleteFromCloudinary(design.glbUrl);

    // Upload new file
    const dataURI = `data:application/octet-stream;base64,${req.file.buffer.toString('base64')}`;
    const result = await uploadToCloudinary(dataURI, `ar-designs/${Date.now()}-${req.file.originalname}`, 'raw');

    design.glbUrl = result.secure_url;
    await design.save();

    res.json(design);
  } catch (err) {
    console.error('[AR REPLACE ERROR]', err);
    res.status(500).send('Replace failed');
  }
};

module.exports.deleteArDesignController = async (req, res) => {
  const { id } = req.params;
  try {
    const design = await arDesignModel.findById(id);
    if (!design) return res.status(404).send('Design not found');

    await deleteFromCloudinary(design.glbUrl);
    await arDesignModel.findByIdAndDelete(id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).send('Delete failed');
  }
};
