const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  category: { type: String },
  description: { type: String },
  oldPrice: { type: Number },
  newPrice: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String },
  discount:{type:Number,default:0},
  isNew:{type:Boolean,default:true}
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
