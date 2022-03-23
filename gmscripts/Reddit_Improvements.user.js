// ==UserScript==
// @name        Reddit Improvements
// @namespace   https://github.com/troyp
// @match       *://*.reddit.com/*
// @version     1
// @grant       none
// ==/UserScript==

// CONVERT LINKS TO OLD REDDIT
var links = [...document.links];
links.forEach(l=>l.href=l.href.replace(/^https?:\/\/[^./]*\.reddit\.com\//, "https://old.reddit.com/"));

// REMOVE PROMOTED CONTENT
var promoted = [...document.querySelectorAll(".promoted")];
promoted.forEach(e=>e.remove());
