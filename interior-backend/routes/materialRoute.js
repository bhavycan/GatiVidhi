const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const {
  getAllMaterialsController,
  getClientMaterialsController,
  createMaterialController,
  updateMaterialController,
  deleteMaterialController,
  setDefaultMaterialController,
} = require('../controllers/material.controller');

const route = express.Router();

route.get('/all', adminAuthentification, getAllMaterialsController);
route.get('/client', userAuthentification, getClientMaterialsController);
route.post('/create', adminAuthentification, createMaterialController);
route.post('/update', adminAuthentification, updateMaterialController);
route.post('/delete', adminAuthentification, deleteMaterialController);
route.post('/set-default', adminAuthentification, setDefaultMaterialController);

module.exports = route;
