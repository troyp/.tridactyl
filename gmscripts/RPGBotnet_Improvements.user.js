// ==UserScript==
// @name        RPGBot.net Improvements
// @namespace   https://github.com/troyp
// @match       https://rpgbot.net/dnd5/*
// @grant       none
// @version     1.0
// @author      Troy Pracy
// @description 03/07/2022, 3:09:37 pm
// ==/UserScript==

// Remove
const removeClasses = ["topad", "shareit", "widget-header"];
removeClasses.forEach(cls => {
    [...document.getElementsByClassName(cls)].forEach(e => e.remove());
});

// Turn item headings into search links on DnDBeyond.com
const ratings = {
    "rating-blue":   "#00f",
    "rating-green":  "green",
    "rating-orange": "#ff8c00",
    "rating-red":    "#b22222"
};
const itemClasses = Object.keys(ratings);
itemClasses.forEach(cls => {
    const elts = [...document.getElementsByClassName(cls)];
    elts.forEach(e => {
        const nodes = [...e.childNodes];
        const textNode = nodes.filter(n=>n.nodeType==3)?.[0];
        const s = textNode.textContent;
        const q = s.replace(" ", "%20");
        // create new link
        const a = document.createElement("a");
        a.href = `https://www.dndbeyond.com/search?q=${q}`;
        a.innerText = s;
        a.style.color = ratings[cls];
        a.style.textDecoration = "none";
        // replace text with link
        e.insertBefore(a, textNode);
        textNode.remove();
    });
});

// Styles
const style = document.createElement("style");
style.classList.add("gmscript");
document.head.appendChild(style);
style.textContent = `
    h4>sup>a[href="/dnd5/abbreviations/"] {
        font-size:        8pt;
        font-weight:      bold;
        text-decoration:  none;
        margin-left:      3px;
        border:           solid 1px;
        border-radius:    4px;
        background-color: #E1EBFF;
    }
    p>span+sup>a[href="/dnd5/abbreviations/"],li>span+sup>a[href="/dnd5/abbreviations/"] {
        font-size:        7pt;
        font-weight:      bold;
        text-decoration:  none;
        margin-left:      2px;
        border:           solid 1px;
        border-radius:    4px;
        background-color: #E1EBFF;
    }
`;
