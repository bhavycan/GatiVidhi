const express = require("express");
const { adminLogInController, adminLogOutController, adminNotificationsController, adminProfileInfoController, updateAdminSelfController, sendAdminOtpController, verifyAdminOtpChangePasswordController, adminForgotPasswordSendOtpController, adminForgotPasswordResetController, dashboardStatsController } = require("../controllers/admin.controller");
const adminAuthentification = require("../middlewares/adminAuthentification");
const route = express.Router();

route.get('/',(req,res)=>{
    res.send("Route connected")
})


route.post("/login",adminLogInController );
route.post('/forgot-password', adminForgotPasswordSendOtpController)
route.post('/reset-password', adminForgotPasswordResetController)
route.post('/logout',adminAuthentification,adminLogOutController)
route.get('/notifications', adminAuthentification, adminNotificationsController)
route.get('/dashboard-stats', adminAuthentification, dashboardStatsController)
route.get('/profile-info', adminAuthentification, adminProfileInfoController)
route.post('/update-self', adminAuthentification, updateAdminSelfController)
route.post('/send-otp', adminAuthentification, sendAdminOtpController)
route.post('/verify-change-password', adminAuthentification, verifyAdminOtpChangePasswordController)

module.exports = route;




