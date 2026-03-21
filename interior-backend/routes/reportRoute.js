const express = require('express');
const { reportCreateController, reportGetAllController } = require('../controllers/report.controller');
const userAuthentification = require('../middlewares/userAuthentification');
const adminAuthentification = require('../middlewares/adminAuthentification');

const route = express.Router();

route.get('/all', userAuthentification, reportGetAllController)
route.get('/create/:id', adminAuthentification, reportCreateController)

module.exports = route