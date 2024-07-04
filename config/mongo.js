const mongoose = require('mongoose')

async function conectToDatabase(params) {
    try {
        await mongoose.connect(process.env.MONGO_URI, {})
        console.log('Success !')
    } catch (error) {
        console.log('Failed !')
        process.exit(1)
    }
}

module.exports = { conectToDatabase }