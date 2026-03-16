const express = require("express");
const adminAuthentification = require("../middlewares/adminAuthentification");
const userAuthentification = require("../middlewares/userAuthentification");
const upload = require('../config/multer');
const { projectCreateController, projectUpdateController, projectDeleteController, DeleteNotificationsController, projectGetAllController, getNotificationsController, clearNotificationsController, projectAdditionalInfoController } = require("../controllers/project.controller");

const route = express.Router();

route.get("/", async(req, res) => {
  res.send("You are at Project route");
});

route.post("/create", adminAuthentification,projectCreateController);
route.post('/update',adminAuthentification,projectUpdateController)
route.post('/delete',adminAuthentification,projectDeleteController)
route.get('/all', adminAuthentification, projectGetAllController)
route.get('/notifications', userAuthentification, getNotificationsController);
route.post('/notifications/clear', userAuthentification, clearNotificationsController);
route.get('/notifications/delete/:index', userAuthentification, DeleteNotificationsController);
route.post('/additional-info', adminAuthentification, upload.single('designPdf'), projectAdditionalInfoController);
module.exports = route;
