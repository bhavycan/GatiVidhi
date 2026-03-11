const express = require("express");
const adminAuthentification = require("../middlewares/adminAuthentification");
const userAuthentification = require("../middlewares/userAuthentification");
const { projectCreateController, projectUpdateController, projectDeleteController, DeleteNotificationsController, projectGetAllController, getNotificationsController, clearNotificationsController } = require("../controllers/project.controller");

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
module.exports = route;
