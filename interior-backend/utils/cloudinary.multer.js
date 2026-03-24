const cloudinary = require('cloudinary').v2;

const uploadToCloudinary = async (dataURI, name, resourceType = 'auto') => {
  try {
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      public_id: name,
      resource_type: resourceType,
    });
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

module.exports = uploadToCloudinary;