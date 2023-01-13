// ==UserScript==
// @name        Fandom Improvements
// @namespace   Violentmonkey Scripts
// @match       https://starwars.fandom.com/wiki/Special:Search
// @grant       none
// @version     1.0
// @author      -
// @description 13/01/2023, 11:12:52 am
// ==/UserScript==
const match = document.location.href.match(/query=\+?[^&]+/);
const query = match?.[0]?.replace(/\+/g, " ");
if (query) document.title=`${query} | Wookiepedia`;
