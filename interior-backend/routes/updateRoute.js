const express = require('express');
const upload = require('../config/multer');
const { updateCreateController, updateDeleteController, updateGetAllController, updateGetAllAdminController, updateTaskCountsController, updateDueTodayController } = require('../controllers/update.controller');
const adminAuthentification = require('../middlewares/adminAuthentification');
const userAuthentification = require('../middlewares/userAuthentification');
const route = express.Router();


route.get('/', (req,res)=>{
    res.send("Hiii you are on the update Route")
});


route.get('/all', userAuthentification, updateGetAllController)
route.get('/due-today', adminAuthentification, updateDueTodayController)
route.get('/admin-all', adminAuthentification, updateGetAllAdminController)
route.get('/task-counts', userAuthentification, updateTaskCountsController)
route.post('/create',adminAuthentification ,  upload.array('images',10),updateCreateController)
route.post('/delete',adminAuthentification,updateDeleteController )

module.exports = route