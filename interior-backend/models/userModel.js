const mongoose = require("mongoose");
const { type } = require("os");
const { Schema } = mongoose;

const userSchema = new Schema({
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
  phone: {
    type: String,
    required: true,
    unique: true,
    // match: [/^[6-9]\d{9}$/, "Please enter a valid Indian phone number"],
  },
  password : {
    type: String,
    required : true,
    
  },
  isVerified : {
    type: Boolean,
    default : false
  },
  role: {
    type : String,
    default : 'user'
  }

});


const validateUser = (user)=>{
    const Joi = require('joi');

const userValidationSchema = Joi.object({
  name: Joi.string().required(),

  email: Joi.string()
    .email({ tlds: { allow: false } }) // disables strict TLD checking
    .required()
    .messages({
      'string.email': 'Please fill a valid email address',
    }),

  phone: Joi.string()
    // .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid Indian phone number',
    }),

  password: Joi.string().required(),
});


return userValidationSchema.validate(user)
}


const User  = mongoose.model('user', userSchema);
module.exports = {userModel : User, validateUser}