const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String}, 
    email: {type: String, required:true, unique: true},
    password: {type: String, required:true},
    role: {type: String, enum: ['member', 'staff', 'admin'], default: 'member'},
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    isEmailVerified: { type: Boolean, default: false },
    resetCode: { type: Number },
    resetCodeExpiration: { type: Date },
})

const User = mongoose.model('users', userSchema);

module.exports = User;