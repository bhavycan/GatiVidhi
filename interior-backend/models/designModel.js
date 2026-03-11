const Joi = require('joi');
const mongoose = require('mongoose');
const {Schema} = mongoose;

const designSchema = new Schema({
    projectId : {type: mongoose.Schema.Types.ObjectId, ref: 'project', required:true},
    images : {type : [String], required: true},
})


const validateDesign = (design) =>{
    
 const designJoiSchema = Joi.object({
  // MongoDB ObjectId is 24-character hex
  projectId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.empty':   'projectId is required',
      'string.pattern.base': 'projectId must be a valid 24-char hex ObjectId'
    }),

  // at least one image path/URL
  images: Joi.array()
    .items(
      // If you only store URLs, keep .uri(); if they can also be local paths, drop .uri()
      Joi.string()
        .trim()
        .uri({ allowRelative: true, scheme: [/https?/] })
        .messages({ 'string.uri': 'Each image must be a valid URL' })
    )
    .min(1)
    .required()
    .messages({
      'array.min':   'Provide at least one image',
      'array.base':  'images must be an array of strings'
    })
});

return designJoiSchema.validate(design)
}


const design = mongoose.model('design',designSchema );
module.exports = {designModel : design, validateDesign}