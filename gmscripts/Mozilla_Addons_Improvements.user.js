// ==UserScript==
// @name        Mozilla Addons Improvements
// @namespace   https://github.com/troyp
// @description Improvements for addons.mozilla.org
// @include     https://addons.mozilla.org/*
// @version     1
// @author      Troy Pracy
// @grant       none
// ==/UserScript==

var dlAnyway = Array.from(document.getElementsByClassName("download-anyway"));
for (e of dlAnyway) {
    e.style.display = "block";
}
