const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name'],
    },
    email: {
        type: String,
        unique: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    role: {
        type: String,
        enum: ['user'],
        default: 'user'
    }
    ,
    password: {
        type: String,
        required: [true, 'Please provide a valid password'],
        minLength: 8,
        select: false
    },
    solvedQuestions: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question'
            }
    ]
});

//Password Hashing during signup
userSchema.pre('save', async function () {
    //if password is actually modified
    if (!this.isModified('password')) return;

    //Hash the passwowrd
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
})

//Bcrypt Password matching during login 
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword)
}



const User = mongoose.model('User', userSchema);
module.exports = User;