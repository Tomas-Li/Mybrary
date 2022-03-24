const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Token = require('./token')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
        max: 100
    },
    firstName: {
        type: String,
        required: true,
        max: 100
    },
    lastName: {
        type: String,
        trim: true,
        required: true,
        max: 100
    },
    bio: {
        type: String,
        required: false,
        max: 255
    },
    profileImage:{
        type: String,
        required: false,
        max: 255
    },
    status: {
        type: String,
        required: true,
        enum: ["Owner", "Manager", "Employee", "Visitor"]
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//! Old encryption method
// userSchema.methods.encryptPassword = async (password) => {
//     return await bcrypt.hash(password, 10);
// }

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password, this.password);
}

//Method for password reset
userSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; //expires in an hour
};

//Method for verificationToken
userSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(20).toString('hex')
    };

    return new Token(payload); //This is an instance from token.js!
};

module.exports = mongoose.model('User', userSchema);