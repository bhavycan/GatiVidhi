const express = require('express');
const {adminModel} = require('../models/adminModel');
const bcrypt = require('bcrypt')

const adminSeederScript = async()=>{

   if( !process.env.ADMIN_EMAIL || !process.env.ADMIN_SECRET) {
      console.error("ADMIN_EMAIL or ADMIN_SECRET not set in .env");
    process.exit(1);
   }

   try {
       let admin = await adminModel.findOne({email: process.env.ADMIN_EMAIL});
    if(admin) {console.log("Admin already existed");  return; }
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(process.env.ADMIN_SECRET,salt);
    admin = await adminModel.create({
        email: process.env.ADMIN_EMAIL,
        password : encryptedPassword,
        name : "SuperAdmin"
    })

    await admin.save();
    console.log("admin created")
    return
    
   } catch (error) {
        console.error(error)
          process.exit(1);
   }

 
}

module.exports = adminSeederScript