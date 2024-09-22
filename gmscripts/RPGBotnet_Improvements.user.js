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
        const s = textNode?.textContent;
        const q = s?.replace(" ", "%20");
        // create new link
        if (q) {
            const a = document.createElement("a");
            a.href = `https://www.dndbeyond.com/search?q=${q}`;
            a.innerText = s;
            a.style.color = ratings[cls];
            a.style.textDecoration = "none";
            // replace text with link
            e.insertBefore(a, textNode);
            textNode.remove();
        }
    });
});

// Styles
const style = document.createElement("style");
style.classList.add("gmscript");
document.head.appendChild(style);
style.textContent = `
    h4>sup>a[href="/dnd5/abbreviations/"],h3>sup>a[href="/dnd5/abbreviations/"] {
        font-size:                    8pt !important;
        font-weight:                  bold !important;
        text-decoration:              none !important;
        margin-left:                  3px !important;
        border:                       solid 1px !important;
        border-radius:                4px !important;
        background-color:             #E1EBFF !important;
    }
    p>span+sup>a[href="/dnd5/abbreviations/"],li>span+sup>a[href="/dnd5/abbreviations/"] {
        font-size:                    7pt !important;
        font-weight:                  bold !important;
        text-decoration:              none !important;
        margin-left:                  2px !important;
        border:                       solid 1px !important;
        border-radius:                4px !important;
        background-color:             #E1EBFF !important;
    }
    table>caption,thead,tbody {
        border:                       2px solid black !important;
    }
    table>caption,thead {
        background-color:             white !important;
    }
    table>caption {
        font-weight:                  bold !important;
        background-color:             white !important;
        margin-bottom:                5px !important;
        border-radius:                5px 5px 0 0 !important;
    }
    thead>tr>th {
        padding:                      5px 15px !important;
    }
`;
