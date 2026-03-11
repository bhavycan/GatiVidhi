const mongoose = require('mongoose')
const {Schema} = mongoose


const BlacklistSchema = new Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: "1d" },
});

BlacklistSchema.index({ token : 1 }, { unique : true }); 

const blacklist = mongoose.model("Blacklist", BlacklistSchema);
module.exports = {blacklistModel : blacklist}