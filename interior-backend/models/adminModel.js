const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
  name: { type: String, required: true },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
    lowercase: true,
  },
  password : {
    type: String,
    required : true,
    
  },

});


const validateadmin = (admin)=>{
    const Joi = require('joi');

const adminValidationSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // disables strict TLD checking
    .required()
    .messages({
      'string.email': 'Please fill a valid email address',
    }),

  
  password: Joi.string().required(),
});


return adminValidationSchema.validate(admin)
}


const admin  = mongoose.model('admin', adminSchema);
module.exports = {adminModel : admin, validateadmin}