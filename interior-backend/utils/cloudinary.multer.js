const cloudinary = require('cloudinary').v2;

const uploadImage = async (dataURI, name) => {
  try {
    
    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      public_id: name,
    });
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error; 
  }
};

module.exports = uploadImage;