const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const upload = require('../config/multer');
const {
  uploadArDesignController,
  getArDesignsByProjectController,
  replaceArDesignController,
  deleteArDesignController
} = require('../controllers/ar.controller');

const route = express.Router();

route.post('/upload', adminAuthentification, upload.single('glbFile'), uploadArDesignController);
route.get('/project/:projectId', getArDesignsByProjectController);
route.patch('/replace/:id', adminAuthentification, upload.single('glbFile'), replaceArDesignController);
route.delete('/:id', adminAuthentification, deleteArDesignController);

module.exports = route;
