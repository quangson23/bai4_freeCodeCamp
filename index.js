const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv').config()

//Model
const { User } = require('./models/User.js')
const { conectToDatabase } = require('./config/mongo.js')
const Exercise = require('./models/Exercise.js')
conectToDatabase();

//Globel middleware
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

//Routing
app
  .get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
  })
  .post("/api/users", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.json({
        error: "Username must be fill"
      })
    }
    try {
      const newUser = new User({
        username: username
      })
      const user = await newUser.save()
      res.json({
        _id: user._id,
        username: user.username
      })
    } catch (error) {
      res.json({ error: 'fail' })
    }
  })
  .get("/api/users", async (req, res) => {
    try {
      const users = await User.find({});
      const switchtoArray = users.map((user) => ({
        _id: user._id.toString(),
        username: user.username
      }))
      res.send(switchtoArray)
    } catch (error) {
      return res.json({ error: "failed" })
    }
  })
  .post("/api/users/:_id/exercises", async (req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body
    try {
      const user = await User.findById(userId)
      const newExercise = new Exercise({
        username: user.username,
        description: description,
        duration: Number(duration),
      })
      if (date) {
        newExercise.date = date
      }
      else {
        newExercise.date = new Date();
      }
      const exercise = await newExercise.save()

      const final = {
        _id: userId,
        username: exercise.username,
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date.toDateString()
      }
      res.json(final)
    } catch (error) {
      console.log(error)
      res.json({ error: 'not ok' })
    }
  })
  // .get('/api/users/:_id/logs', async (req, res) => {

  //   const { from, to, limit } = req.query

  //   const id = req.params._id
  //   const user = await User.findById(id);
  //   const count = await Exercise.countDocuments({ username: { $eq: user.username } })
  //   const docs = await Exercise.find({ username: user.username })
  //   const logs = docs.map(doc => ({
  //     description: doc.description,
  //     duration: doc.duration,
  //     date: doc.date.toDateString()
  //   }))
  //   const finalRes = {
  //     username: user.username,
  //     count: Number(count),
  //   }

  //   finalRes.log = logs;
  //   res.json(finalRes)
  // })
  app.get('/api/users/:_id/logs', async (req, res) => {
    const { from, to, limit } = req.query;
    const id = req.params._id;
  
    try {
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let query = { username: user.username };
  
      // Filter logs by date range if from and/or to are provided
      if (from || to) {
        query.date = {};
        if (from) {
          query.date.$gte = new Date(from);
        }
        if (to) {
          query.date.$lte = new Date(to);
        }
      }
  
      // Fetch logs with optional filtering and limiting
      let logsQuery = Exercise.find(query);
  
      if (limit) {
        logsQuery = logsQuery.limit(parseInt(limit, 10));
      }
  
      const docs = await logsQuery.exec();
  
      const logs = docs.map(doc => ({
        description: doc.description,
        duration: doc.duration,
        date: doc.date.toDateString(),
      }));
  
      const count = docs.length;
  
      const finalRes = {
        username: user.username,
        count: Number(count),
        log: logs,
      };
  
      res.json(finalRes);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
  });
  
//Server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
