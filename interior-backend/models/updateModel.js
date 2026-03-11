const mongoose = require('mongoose');
 const {Schema} = mongoose;
const Joi = require('joi');

const updateSchema = new Schema({
    projectId: {
    type: mongoose.Types.ObjectId,
    ref: 'project',
    required: true,
  },
  images: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.every((url) => typeof url === 'string' && url.length > 0);
      },
      message: 'All image URLs must be non-empty strings',
    },
    default: [],
  },
  workDone: {
    type: String,
    maxlength: 1000,
  },
  workLeft: {
    type: String,
    maxlength: 1000,
  },
  notes: {
    type: String,
    required: true,
    minlength: 3,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})



const validateUpdate = (update) =>{
    const updateJoiSchema = Joi.object({
  projectId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }, 'ObjectId validation')
    .required(),

  images: Joi.array().items(Joi.string().uri()).optional(),

  workDone: Joi.string().max(1000).allow('', null),
  workLeft: Joi.string().max(1000).allow('', null),
  notes: Joi.string().min(3).required(),
  createdAt: Joi.date().optional(),
});


return updateJoiSchema.validate(update);
}

const update = mongoose.model('dailyupdate', updateSchema)
module.exports = {updateModel : update, validateUpdate}