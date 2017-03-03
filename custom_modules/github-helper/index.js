var request = require('request')

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
    var options = {
      url: HOST + user + "/" + repo + "/issues?state=open",
      headers: {
        'User-Agent': 'request',
        'Accept': 'application/vnd.github.v3+json'
      },
      json: true
    }

    request(options, function(error, response, body) {
      if (error || response.statusCode === 404 ) {
        cb(404, null)
      } else {
        cb(null, body)
      }
    })
  }
}
