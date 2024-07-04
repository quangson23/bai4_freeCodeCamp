const mongoose = require('mongoose')

const exerciseSchema = mongoose.Schema({
    username: String,
    description: String,
    duration: Number,
    date: {
        type: Date,
    },
})

const Exercise = mongoose.model("Exercise", exerciseSchema)

module.exports = Exercise