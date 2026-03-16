const express = require('express');
const adminAuthentification = require('../middlewares/adminAuthentification');
const workerAuthentification = require('../middlewares/workerAuthentification');
const {
  createWorkerController,
  getAllWorkersController,
  assignProjectController,
  deleteWorkerController,
  workerLoginController,
  workerProfileController,
} = require('../controllers/worker.controller');

const route = express.Router();

route.post('/login', workerLoginController);
route.get('/profile', workerAuthentification, workerProfileController);

route.post('/create', adminAuthentification, createWorkerController);
route.get('/all', adminAuthentification, getAllWorkersController);
route.post('/assign-project', adminAuthentification, assignProjectController);
route.post('/delete', adminAuthentification, deleteWorkerController);

module.exports = route;
