const Joi = require('joi');
const mongoose = require('mongoose');
const {Schema} = mongoose;

const projectSchema = new Schema({
    projectName : {type:String, required: true},
    description : {type: String, required : true},
    clientId : { type: mongoose.Schema.Types.ObjectId, ref: 'user',required :true},
    startDate : {type: Date, required : true},
    estimatedEndDate : {type : Date},
    status: { type: String, default: 'ongoing' },
    paymentRecords :{type : [mongoose.Schema.Types.ObjectId], ref: 'payments'},
    updates : {type: [mongoose.Schema.Types.ObjectId], ref: 'dailyupdate' },
  notifications: [{
    type: { type: String, enum: ['update', 'task', 'ticket', 'report'] },
    message: { type: String },
    createdAt: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  squareFeet: { type: Number },
  totalRooms: { type: Number },
  designPdfUrl: { type: String },
})


const validateProject = (project)=>{
    const validateProjectSchema = Joi.object({
  projectName: Joi.string().required(),
   description: Joi.string().required(),
   status : Joi.string().required(),
  clientId: Joi.string().required().custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error("any.invalid");
    }
    return value;
  }, "ObjectId Validation"),
  startDate: Joi.date().required(),
  estimatedEndDate: Joi.date().optional(),
  paymentRecords: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
  ).optional(),
  updates: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
  ).optional()
});

return validateProjectSchema.validate(project)
}

const project = mongoose.model('project', projectSchema);
module.exports = {projectModel : project, validateProject}