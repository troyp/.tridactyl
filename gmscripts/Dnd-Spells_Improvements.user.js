// ==UserScript==
// @name        DnD-Spells Improvements
// @namespace   https://github.com/troyp
// @match       https://www.dnd-spells.com/*
// @grant       none
// @version     1.0
// @author      -
// @description 03/06/2023, 9:38:03 pm
// ==/UserScript==

// Replace dnd-spells.com links to spell descriptions by dndbeyond.com links
[...document.getElementsByTagName("a")].forEach(l=>{
    l.href = l.href.replace("https://www.dnd-spells.com/spell/", "https://www.dndbeyond.com/spells/");
});
