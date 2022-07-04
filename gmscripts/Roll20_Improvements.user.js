// ==UserScript==
// @name        Roll20_Improvements
// @namespace   https://github.com/troyp
// @match       https://roll20.net/compendium/dnd5e/*
// @grant       none
// @version     1.0
// @author      Troy Pracy
// @description 26/06/2022, 4:46:19 am
// ==/UserScript==

function $1(sel) { return document.querySelector(sel); }
function $$(...sels) { return [...document.querySelectorAll(sels.join(","))]; }

$1("img.withad").style.margin = "0";
document.getElementsByClassName("bna")?.[0]?.remove();

const sc = document.getElementsByClassName("searchcontainer")[0];
sc.querySelector("h1").remove();
sc.querySelector("h2").remove();
sc.querySelector("p").remove();
const h = document.createElement("h1");
h.textContent = "D&D 5th Edition Compendium";
h.style.fontSize = "30pt";
sc.insertBefore(h, sc.firstChild);

const searchbtn = document.getElementById("homesearchbutton");
searchbtn.style.padding="0em 0.1em";
searchbtn.style.height="1.5em";

$$(".btn-group").forEach(e=>e.style.fontSize = "12pt");
$$(".simplecontainer").forEach(e=>e.style.fontSize = "12pt");
