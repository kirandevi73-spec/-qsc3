const mongoose = require('mongoose'); 
 
const fileSchema = new mongoose.Schema({ 
  filename: { type: String, required: true }, 
  cid: { type: String, required: true, unique: true }, 
  size: { type: Number, required: true }, 
  mimeType: { type: String }, 
  uploadedAt: { type: Date, default: Date.now } 
}); 
 
module.exports = mongoose.model('File', fileSchema); 
