const express = require("express");

const upload = require("../config/multer");

const {
  designCreateController,
  designDeleteController,
} = require("../controllers/design.controller");
const route = express.Router();

route.get("/", (req, res) => {
  res.send("You are at design route");
});

route.post("/create", upload.array("images", 10), designCreateController);

route.post("/delete", designDeleteController);

module.exports = route;
