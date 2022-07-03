// ==UserScript==
// @name        RPG.net Improvements
// @namespace   https://github.com/troyp
// @match       https://rpgbot.net/dnd5/*
// @grant       none
// @version     1.0
// @author      -
// @description 03/07/2022, 3:09:37 pm
// ==/UserScript==

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
        const s = e.innerText;
        const q = s.replace(" ", "%20");
        e.innerText = "";
        const a = document.createElement("a");
        a.href = `https://www.dndbeyond.com/search?q=${q}`;
        a.innerText = s;
        a.style.color = ratings[cls];
        e.append(a);
    });
});
