const port = 3000
const express = require('express')
const app = express()

const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + fileExtension(file.mimetype)) //Appending extension
  }
})
const upload = multer({ storage: storage })

const bcrypt = require('bcrypt')
const saltRounds = 10

const fileExtension = (mimeType) => {
  if (mimeType == 'image/gif') { return '.gif'}
  if (mimeType == 'image/jpeg') { return '.jpg'}
  if (mimeType == 'image/png') { return '.png'}
  return ''
}

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

app.post('/welkom', (req, res) => {
  const hash = bcrypt.hashSync(req.body.password, saltRounds);
  res.render('welkom.ejs', {
    userName: req.body.name,
    userMail: req.body.email,
    userPass: req.body.password,
    hashedPass: hash
  })
})

app.post('/welkomimg', upload.single('avatar'), (req, res) => {
  // console.log(req.file)
  res.render('welkomimg.ejs', {
    userName: req.body.name,
    userMail: req.body.email,
    userPass: req.body.password,
    imgURL: req.file.filename
  })
})

app.use((req, res, next) => {
  console.log('404 error at URL: ' + req.url)
  res.status(404).render('not_found.ejs', { url: req.url })
})

app.listen(port, () => {
  console.log(`Webserver listening on port ${port}`)
})
