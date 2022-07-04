// ==UserScript==
// @name        Google Improvements
// @namespace   https://github.com/troyp
// @match       https://www.google.com/*
// @version     1
// @author      Troy Pracy
// @grant       none
// ==/UserScript==

// ╭────────────────────────╮
// │ Advanced Search Button │
// ╰────────────────────────╯
const searchBox = document.querySelector("#searchform>div>form");
const advBtn = document.createElement("div");
advBtn.style.display = "block";
advBtn.style.zIndex = "10";
advBtn.style.width = "100%";
advBtn.style.marginLeft = "40px";
const advLink = document.createElement("a");
advLink.href = "https://www.google.com/advanced_search";
advLink.textContent = "Advanced Search";
advLink.classList.add("adv-search");
advLink.style.display = "table-cell";
advLink.style.verticalAlign = "middle";
advLink.style.color = "#5f6368";
advLink.style.border = "solid 2px grey";
advLink.style.borderRadius = "5px";
advLink.style.padding = "5px";
advBtn.appendChild(advLink);
searchBox.after(advBtn);
// hover styling
const advStyle = document.createElement("style");
const advStyleText = ".adv-search:hover { background-color: #f5f5f5; text-decoration: none; }";
advStyle.appendChild(document.createTextNode(advStyleText));
document.head.appendChild(advStyle);

