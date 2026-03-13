const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const {
  templateGetAllController,
  templateCreateController,
  templateUpdateController,
  templateDeleteController,
} = require('../controllers/template.controller');

const route = express.Router();

route.get('/all', adminAuthentification, templateGetAllController);
route.post('/create', adminAuthentification, templateCreateController);
route.post('/update', adminAuthentification, templateUpdateController);
route.post('/delete', adminAuthentification, templateDeleteController);

module.exports = route;
