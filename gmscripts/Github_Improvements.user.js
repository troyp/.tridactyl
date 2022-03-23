// ==UserScript==
// @name        Github Improvements
// @namespace   https://github.com/troyp
// @include     https://*github.com/*
// @version     1
// @grant       none
// ==/UserScript==
var url = document.location.href;

if (url.match(/https:\/\/github\.com\/[^/]+\/[^/]+/)) {
    Array.from(document.links).forEach(
        l=>{
            l.id=l.id.replace("user-content-", "");
            l.name=l.name.replace("user-content-", "");
        }
    );
}

// Fix black issue labels: make grey
if (url.match(/\/issues/)) {
    var labels = [...document.getElementsByClassName("hx_IssueLabel")];
    var blacklabels = labels.filter(e=>e.getAttribute("style").includes("--label-r:0;--label-g:0;--label-b:0;"));
    blacklabels.forEach(e=>e.setAttribute("style", "--label-r:200;--label-g:200;--label-b:200;"));
}
