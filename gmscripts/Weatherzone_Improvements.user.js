// ==UserScript==
// @name        Weatherzone Improvements
// @namespace   https://github.com/troyp
// @include     https://*weatherzone.com.au/*
// @version     1
// @grant       none
// ==/UserScript==

document.querySelector("div[class*=commonstyle__TopBannerTablet]").remove();
document.querySelector("nav").style.display = "none";
document.getElementById("weatherzone-main").style.display = "none";
