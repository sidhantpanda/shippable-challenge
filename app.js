var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var URLParser = require('url')
var githubHelper = require('./custom_modules/github-helper')

var app = express()
app.set('view engine', 'ejs')
app.set('port', (process.env.PORT || 5000))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/semantic', express.static(path.join(__dirname, 'semantic')))

app.get('/', function (req, res) {
  res.render('pages/index')
})

app.get('/check', function(req, res) {
  res.render('pages/error', {
    error: "Some error occurred"
  })
})

app.post('/result', function (req, res) {
  var url = req.body.url;
  if (isValidGithubRepo(url)) {
    var user = getGithubUser(url)
    var repo = getGithubRepo(url)

    githubHelper.checkIfRepoExists(user, repo, function(status, body) {
      if (status === 200) {
        githubHelper.getOpenIssues(user, repo, function (error, response) {
          if (error) {
            res.render('pages/error', {
              error: "Some error occurred"
            })
          } else {
            // console.log(JSON.stringify(response)
            res.render('pages/error', {
              error: "Not a github repo"
            })
          }
        })
      } else {
        res.render('pages/error', {
          error: "Not a github repo"
        })
      }
    })
  } else {
    res.render('pages/error', {
      error: "Not a github repo"
    })
  }
})

function isValidGithubRepo(url) {
  var parsed = URLParser.parse(url)
  if (parsed.host !== "github.com") {
    return false
  }
  return true
}

function getGithubUser(url) {
  var path = URLParser.parse(url).path
  var firstOccurence = path.indexOf("/")
  var secondOccurence = path.indexOf("/", firstOccurence+1)
  // console.log(path.substring(firstOccurence+1, secondOccurence) + "-" + path.substring(secondOccurence+1))
  return path.substring(firstOccurence+1, secondOccurence)
}

function getGithubRepo(url) {
  var path = URLParser.parse(url).path
  var firstOccurence = path.indexOf("/")
  var secondOccurence = path.indexOf("/", firstOccurence+1)
  return path.substring(secondOccurence+1)
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
});
