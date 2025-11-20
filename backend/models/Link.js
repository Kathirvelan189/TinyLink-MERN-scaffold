const mongoose = require("mongoose");
const { Schema } = mongoose;

const LinkSchema = new Schema({
  code: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  clicks: { type: Number, default: 0 },
  lastClicked: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Link", LinkSchema);
