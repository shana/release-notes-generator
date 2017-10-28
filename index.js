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

eventEmitter.on('label', function(labels, count, page, lastpage, date) {
    github.issues.repoIssues({
        user: "github",
        repo: "VisualStudio",
        state: "closed",
        labels: labels[count],
        page: page,
        per_page: 100
    }, function(err, res) {
    console.log(labels.length + ":" + count + ":" + page + ":" + lastpage);
        //console.log(err);
        //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
        //var list = "";
        console.log("## " + labels[count] + " Page " + page);
        for (var issue in res) {
            if (!res[issue].pull_request && res[issue].closed_at > date)
                //list += "Issue " + res[issue].closed_at + " - #" + res[issue].number + " - " + res[issue].title + os.EOL;
                console.log(" - #" + res[issue].number + " - " + res[issue].title);
        }

        if (page < lastpage)
        {
            eventEmitter.emit('label', labels, count, page+1, lastpage, date);
        }
        else if (labels.length - 1 > count)
        {
            eventEmitter.emit('label', labels, count+1, 1, lastpage, date);
        }
        else
        {
            eventEmitter.emit('pr', date);
        }
    });
});

eventEmitter.on('pr', function(date) {
    github.pullRequests.getAll({
        user: "github",
        repo: "VisualStudio",
        state: "closed",
        page: 1,
        per_page: 100
    }, function(err, res) {
    
        //console.log(err);
        //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
        //var list = "";
        console.log("## PRs");
        for (var pr in res) {
            if (res[pr].merged_at > date && res[pr].base['ref'] == 'master') {
                console.log("- #" + res[pr].number + " - " + res[pr].title);
            }
        }
        eventEmitter.emit('finish');
    })
});

eventEmitter.on('finish', function() {
});
function getReleaseChangeLog()
{
    github.releases.listReleases({
        owner: "github",
        repo: "VisualStudio",
        page: 1,
        per_page: 2
    }, function(err, releases) {

        for (var j = 1; j < releases.length; j++)
        {
            var res = releases[j];
            if (res.draft)
                continue;

            //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
            var tag = res.tag_name;
            var date = res.created_at;
            date = "2017-09-13T23:59:59Z"
            console.log(date);
            eventEmitter.emit('label', ["bug", "enhancement", "feature"], 0, 1, 2, date);

            // github.repos.getTags({
            //     user: "github",
            //     repo: "VisualStudio",
            // }, function(err, res) {
            //     var t = res.filter(function(el) {
            //         return el.name == tag;
            //     });
            //     var sha = t[0].commit.sha;
            //     //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));

            //     github.issues.repoIssues({
            //         user: "github",
            //         repo: "VisualStudio",
            //         state: "closed",
            //         labels: "bug",
            //         page: 1,
            //         per_page: 100
            //     }, function(err, res) {
            //         //console.log(err);
            //         //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
            //         //var list = "";
            //         console.log("## Fixes");
            //         for (var issue in res) {
            //             if (!res[issue].pull_request && res[issue].closed_at > date)
            //                 //list += "Issue " + res[issue].closed_at + " - #" + res[issue].number + " - " + res[issue].title + os.EOL;
            //                 console.log(" - #" + res[issue].number + " - " + res[issue].title);
            //         }

            //         github.issues.repoIssues({
            //         user: "github",
            //         repo: "VisualStudio",
            //         state: "closed",
            //         page: 2,
            //         per_page: 100
            //         }, function(err, res) {
            //             if (!err)
            //             {
            //                 for (var issue in res) {
            //                     if (!res[issue].pull_request && res[issue].closed_at > date)
            //                         //list += "Issue " + res[issue].closed_at + " - #" + res[issue].number + " - " + res[issue].title + os.EOL;
            //                         console.log(" - #" + res[issue].number + " - " + res[issue].title);
            //                 }
            //             }

            //         list += "=====" + os.EOL;
            //         github.pullRequests.getAll({
            //             user: "github",
            //             repo: "VisualStudio",
            //             state: "closed",
            //             head: sha
            //         }, function(err, res) {
            //             //console.log(JSON.stringify(JSON.parse(JSON.stringify(res)),null,'\t'));
            //             for (var pr in res) {
            //                 if (res[pr].merged_at > date) {
            //                     if (res[pr].base['ref'] == 'master')
            //                         list += "PR - from " + res[pr].head['ref'] + " to " + res[pr].base['ref'] + " - #" + res[pr].number + " - " + res[pr].title + os.EOL;
            //                 }
            //             }
            //             console.log(list);
            //         });
            //                             });
            //     });
            // });
            break;
        }
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