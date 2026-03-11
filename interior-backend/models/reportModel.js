const mongoose = require('mongoose');
const {Schema} = mongoose;
const Joi = require("joi");

const reportSchema = new Schema({
    projectId : {type: mongoose.Schema.Types.ObjectId, ref : 'project', required : true},
    summary : {type : String, required : true},
    PublishedDate : {type : Date, default : Date.now()}
})


const validateReport = (report) =>{
    const reportValidationSchema = Joi.object({
  projectId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error("any.invalid");
      }
      return value;
    }, "ObjectId Validation")
    .required(),
  
  summary: Joi.string().trim().min(10).required(),

});

    return reportValidationSchema.validate(report);
}

const report = mongoose.model('report',reportSchema);
module.exports = {reportModel : report, validateReport}