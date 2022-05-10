const express = require('express')
const app = express()
const port = 3000

app
  .use(express.static('static'))
  .set('view engine', 'ejs')
  .set('views', 'view')

app.get('/', (req, res) => {
  res.send('<img src="/image/eend.gif" width="150">Hello Worlds!')
})

app.use((req, res, next) => {
  console.log('404 error at URL: ' + req.url)
  res.status(404).render('not_found.ejs', {url: req.url})
})

app.listen(port, () => {
  console.log(`Webserver listening on port ${port}`)
})
