require('dotenv').config()

const express = require('express')
const app = express()

const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + fileExtension(file.mimetype)) // Appending extension
  }
})
const upload = multer({ storage: storage })

const bcrypt = require('bcrypt')
const saltRounds = 10

const fileExtension = (mimeType) => {
  if (mimeType === 'image/gif') { return '.gif' }
  if (mimeType === 'image/jpeg') { return '.jpg' }
  if (mimeType === 'image/png') { return '.png' }
  return ''
}

const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = 'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST + '/' + process.env.DB_NAME + '?retryWrites=true&w=majority'
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 })
client.connect(err => {
  if (err) { throw err }
  // client.close()
})

app
  .use(express.static('static'))
  .use(express.static('uploads'))
  // .use(express.json())
  .use(express.urlencoded({ extended: true }))
  .set('view engine', 'ejs')
  .set('views', 'view')

app.get('/', (req, res) => {
  res.send('<img src="/image/eend.gif" width="150">Hello Worlds!')
})

app.get('/home/:user/', (req, res) => {
  console.log(`Input from ${req.params.user}`)
  res.send(`<img src="/image/eend.gif" width="150">Hello ${req.params.user}!`)
})

app.post('/welkom', upload.single('avatar'), (req, res) => {
  const done = (err, data) => {
    if (err) { console.log('Database error: ' + err) }
    if (data[0]) {
      res.send('User already exists') // already present in database
    } else {
      collection.insertOne({
        name: req.body.name,
        pwhash: hash,
        email: req.body.email,
        avatar: req.file.filename
      })
      res.render('welkom.ejs', {
        userName: req.body.name,
        userMail: req.body.email,
        hashedPass: hash,
        imgURL: req.file.filename
      })
    }
  }

  const hash = bcrypt.hashSync(req.body.password, saltRounds)
  const collection = client.db(process.env.DB_NAME).collection('users')
  collection.find({ name: req.body.name }).toArray(done)
})

app.post('/enter', (req, res) => {
  const done = (err, data) => {
    if (err) { console.log('Database error: ' + err) }
    if (data[0]) {
      if (bcrypt.compareSync(req.body.password, data[0].pwhash)) {
        res.render('welkom.ejs', {
          userName: data[0].name,
          userMail: data[0].email,
          hashedPass: data[0].pwhash,
          imgURL: data[0].avatar
        })
      } else {
        res.send('** Intruder alert **') // incorrect password
      }
    } else {
      res.send('Unknown user') // username not found in database
    }
  }

  const collection = client.db(process.env.DB_NAME).collection('users')
  collection.find({ name: req.body.name }).toArray(done)
})

app.use((req, res, next) => {
  console.log('404 error at URL: ' + req.url)
  res.status(404).render('not_found.ejs', { url: req.url })
})

app.listen(process.env.PORT, () => {
  console.log(`Shaking it up on port ${process.env.PORT}`)
})
