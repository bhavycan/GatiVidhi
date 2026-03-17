const express = require("express");
const { adminLogInController, adminLogOutController, adminNotificationsController } = require("../controllers/admin.controller");
const adminAuthentification = require("../middlewares/adminAuthentification");
const route = express.Router();

route.get('/',(req,res)=>{
    res.send("Route connected")
})


route.post("/login",adminLogInController );
route.post('/logout',adminAuthentification,adminLogOutController)
route.get('/notifications', adminAuthentification, adminNotificationsController)

module.exports = route;




