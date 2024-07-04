const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        required: true,
        unique: true,
        trim: true,
        type: String
    },
})

const User = mongoose.model('User', userSchema)

module.exports = { User }