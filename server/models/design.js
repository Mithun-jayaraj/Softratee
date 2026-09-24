const mongoose = require('mongoose');
const designSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Design = mongoose.model('Design', designSchema);
module.exports = Design;
