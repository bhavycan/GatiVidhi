const express = require("express");
const adminAuthentification = require("../middlewares/adminAuthentification");
const { projectCreateController, projectUpdateController, projectDeleteController, projectGetAllController } = require("../controllers/project.controller");

const route = express.Router();

route.get("/", async(req, res) => {
  res.send("You are at Project route");
});

route.post("/create", adminAuthentification,projectCreateController);
route.post('/update',adminAuthentification,projectUpdateController)
route.post('/delete',adminAuthentification,projectDeleteController)
route.get('/all', adminAuthentification, projectGetAllController)
module.exports = route;
