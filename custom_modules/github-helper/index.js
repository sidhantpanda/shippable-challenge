var request = require('request')
var async = require('async')
var linkHeaderParser = require('parse-link-header')

var HOST = "https://api.github.com/repos/"

module.exports = {
  checkIfRepoExists: function(user, repo, cb) {
    var options = {
      url: HOST + user + "/" + repo,
      headers: {
        'User-Agent': 'request',
        'Accept': 'application/vnd.github.v3+json'
      },
      json: true
    }

    request(options, function(error, response, body) {
      if (error || response.statusCode === 404) {
        cb(404, null)
      } else {
        cb(200, body)
      }
    })
  },

  getOpenIssues: function(user, repo, cb) {
    var issues = []
    var options = {
      url: HOST + user + "/" + repo + "/issues?state=open&per_page=100&access_token=2abe7b149e4a81d99af30814a96d3b3c015c59a0",
      headers: {
        'User-Agent': 'request',
        'Accept': 'application/vnd.github.v3+json'
      },
      json: true
    }

    var thisResponse = null

    async.doWhilst(function(callback) {
      request(options, function(error, response, body) {
        if (error) {
          callback(error, null)
        } else if (response.statusCode != 200) {
          callback(response.statusCode, null)
        } else {
          issues = issues.concat(body)
          thisResponse = response
          callback()
        }
      })
    }, function() {
      var parsed = linkHeaderParser(thisResponse.headers.link)
      if (parsed.next != null) {
        options.url = parsed.next.url
        return true
      } else {
        return false
      }
    }, function(err, n) {
      cb(err, issues)
    })
  }
}
