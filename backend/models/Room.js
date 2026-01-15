const mongoose = require('mongoose');

const roomSchema = mongoose.Schema({
      name: { type: String, required: true },
      creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      inviteCode: { type: String, unique: true, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
