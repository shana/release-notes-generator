//var GitHubApi = require("github");
var os = require('os');
var fs = require('fs');
var readlineSync = require('readline-sync');
var events = require('events');
var github = require('./auth.js')

var eventEmitter = new events.EventEmitter();

github.events.on('authenticated', function(token) {
    getReleaseChangeLog();
})

github.login();

function getReleaseChangeLog()
{
    github.releases.listReleases({
        owner: "github",
        repo: "VisualStudio",
        page: 1,
        per_page: 1
    }, function(err, releases) {
        var res = releases[0];
        //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
        var tag = res.tag_name;
        var date = res.created_at;

        github.repos.getTags({
            user: "github",
            repo: "VisualStudio",
        }, function(err, res) {
            var t = res.filter(function(el) {
                return el.name == tag;
            });
            var sha = t[0].commit.sha;
            //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));

            github.issues.getAll({
                user: "github",
                repo: "VisualStudio",
                state: "closed",
                since: date
            }, function(err, res) {
                //console.log(JSON.stringify(res));
                var list = "";
                for (var issue in res) {
                    if (issue != "meta")
                        list += "- #" + res[issue].number + " - " + res[issue].title + os.EOL;
                }
                list += "=====" + os.EOL;
                github.pullRequests.getAll({
                    user: "github",
                    repo: "VisualStudio",
                    state: "closed",
                    head: sha
                }, function(err, res) {
                    //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
                    for (var pr in res) {
                        if (res[pr].merged_at > date)
                            list += "- #" + res[pr].number + " - " + res[pr].title + os.EOL;
                    }
                    console.log(list);
                });
            });
        });
    });
}

/*
github.pullRequests.getAll({
    user: "github",
    repo: "VisualStudio",
    state: "all"
}, function(err, res) {
    console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
    var list = "";
    for (var pr in res) {
        list += "- #" + res[pr].number + " - " + res[pr].title + os.EOL;
    }
    console.log(list);
});
*/