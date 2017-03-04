var express = require('express')
var path = require('path')
var bodyParser = require('body-parser')
var URLParser = require('url')
var githubHelper = require('./custom_modules/github-helper')

var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/semantic', express.static(path.join(__dirname, 'semantic')))

app.set('view engine', 'ejs')
app.set('port', (process.env.PORT || 3000))

app.get('/', function (req, res) {
  res.render('pages/index')
})

app.get('/check', function(req, res) {
  var error = "fff"
  console.log(error)
  res.render('pages/result', {
    error: error,
    user: "fefe",
    repo: "femne",
    issues: "fejen"
  })
})

app.post('/result', function (req, res) {
  var url = req.body.url;
  if (isValidGithubRepo(url)) {
    var user = getGithubUser(url)
    var repo = getGithubRepo(url)

    githubHelper.checkIfRepoExists(user, repo, function(status, body) {
      if (status === 200) {
        githubHelper.getOpenIssues(user, repo, function (error, issues) {
          console.log("Total: " + issues.length)
          if (error) {
            res.render('pages/error', {
              error: error
            })
          } else {
            var issues24h = getIssues(0, 24, issues)
            var issues7d = getIssues(24, 7*24, issues)
            var issuesO = getIssues(7*24, -1, issues)
            // console.log(JSON.stringify(response))
            res.render('pages/result', {
              error: error,
              user: user,
              repo: repo,
              issues24h: issues24h,
              issues7d: issues7d,
              issuesO: issuesO,
            })

          }
        })
      } else {
        console.log("2")
        res.render('pages/error', {
          error: "Not a github repo"
        })
      }
    })
  } else {
    console.log("1")
    res.render('pages/error', {
      error: "Not a github repo"
    })
  }
})

function getIssues(startHour, endHour, issues) {
  var result = []
  var now = new Date();
  for(var i=0; i<issues.length; i++) {
    var issueDate = new Date(issues[i].created_at)
    if (issues[i].pull_request == null) {
      if ((now - (startHour * 60 * 60 * 1000)) > issueDate) {
        if (endHour === -1) {
          result.push(issues[i])
        } else if ((now - (endHour * 60 * 60 * 1000)) < issueDate) {
          result.push(issues[i])
        }
      }
    }
  }
  return result
}

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
  var last1 = path.indexOf("/", secondOccurence+1)
  var last2 = path.indexOf("#", secondOccurence+1)
  if (last1 > 0) {
    return path.substring(secondOccurence+1, last1)
  } else if (last2 > 0) {
    return path.substring(secondOccurence+1, last2)
  }
  return path.substring(secondOccurence+1)
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'))
});
