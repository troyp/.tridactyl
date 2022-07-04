// ==UserScript==
// @name        Jisho Improvements
// @namespace   https://github.com/troyp
// @description Jisho Improvements
// @include     https://jisho.org/*
// @version     1
// @author      Troy Pracy
// @grant       none
// ==/UserScript==

// jshint esversion: 6

var REMOVE_ADS = false;

var page = document.getElementById('page_container');

// keyword
var kwElt = document.getElementById("keyword");
var kwTyped = kwElt.value;
var kw = kwElt.attributes["data-effective-keyword"].value;
if (kw=="actual") kw = kwElt.value;

// -------------------------------------------------------------------------------
// ,-------------,
// | Word Search |
// '-------------'

// highlight exact matches
var exactBlock = document.querySelector("div.exact_block");
if (exactBlock) {
    exactBlock.style.backgroundColor = "#FFF5F5";
    exactBlock.style.padding = "1em";
}
// remove margin between tags
var tags = Array.from(document.getElementsByClassName("concept_light-tag"));
tags.forEach(e=>{e.style = "margin: 0"});

// inflections links
var defnsWithInflections = Array.from(document.getElementsByClassName("show_inflection_table"));
defnsWithInflections.forEach(e=>{e.text = "Inflections"});

// definitions (excluding names)
function uniqKanji(s) {
    var match = s.match(/[一-龥𠮟]/g);
    return [...new Set(match)];
}

var defns = Array.from(document.getElementById("primary").getElementsByClassName("concept_light"));
defns.forEach((e, i, a)=>{
    var statusBlock = e.getElementsByClassName("concept_light-status")[0];
    // var dropdownList = document.getElementsByClassName("f-dropdown");

    // kanji link (incl other forms kanji)
    var entry = e.querySelector(".concept_light-representation>.text").textContent;
    var other_forms_tag = Array.from(e.getElementsByClassName("meaning-tags")).find(e=>e.textContent.match("Other forms"));
    var other_forms_entry = other_forms_tag ? other_forms_tag.nextElementSibling.textContent : "";
    var kanji = uniqKanji(entry + other_forms_entry);
    var kanji_url = `https://jisho.org/search/${kanji.join("")}%20%23kanji`;
    var new_kanji_link = document.createElement("a");
    new_kanji_link.href = kanji_url;
    new_kanji_link.textContent = "Kanji details";
    statusBlock.appendChild(new_kanji_link);
});

// extra dictionaries
var dictList = document.querySelector("#other_dictionaries>ul");
var extraDictLinks = [
    `<a href='https://www.kanshudo.com/searchq?q=${kw}'>Search Kanshudo for ${kw}</a>`,
    `<a href='https://en.wiktionary.org/w/index.php?search=${kw}'>Search English Wiktionary for ${kw}</a>`,
    `<a href='https://ja.wiktionary.org/w/index.php?search=${kw}'>Search Japanese Wiktionary for ${kw}</a>`,
    `<a href='https://en.wikipedia.org/w/index.php?search=${kw}'>Search English Wikipedia for ${kw}</a>`,
    `<a href='https://ja.wikipedia.org/w/index.php?search=${kw}'>Search Japanese Wikipedia for ${kw}</a>`,
];
dictList && extraDictLinks.forEach(a => {
    var liDict = document.createElement("li");
    liDict.innerHTML = a;
    dictList.appendChild(liDict);
})

// wikipedia definitions
var tags = Array.from(document.getElementsByClassName("meaning-tags"));
var wpTags = tags.filter(e=>e.textContent.match(/Wikipedia definition/));
wpTags.forEach(e=>{
    var wpDefn = e.nextSibling.getElementsByClassName("meaning-meaning")[0];
    var wpDefnStr = wpDefn && wpDefn.textContent.replace(/^\s+|\s+$/g, "");
    var resultDiv = e.parentElement.parentElement.parentElement;
    var wpKanji = resultDiv && resultDiv.getElementsByClassName("text")[0];
    var wpKanjiStr = wpKanji && wpKanji.textContent.replace(/^\s+|\s+$/g, "");
    var wpLinks = [
        `<a href="http://en.wikipedia.org/wiki/${wpDefnStr}">EN.wp</a>`,
        `<a href="http://ja.wikipedia.org/wiki/${wpKanjiStr}">JA.wp</a>`,
        `<a href="http://dbpedia.org/resource/${wpDefnStr}">DBpedia</a>`,
    ];
    var detailsLink = resultDiv.getElementsByClassName("light-details_link");
    var linksList = document.createElement("ol");
    resultDiv.appendChild(linksList, detailsLink);
    wpLinks.forEach(a=>{
        var liLink = document.createElement("li");
        liLink.innerHTML = a;
        linksList.appendChild(liLink);
    });
})

// -------------------------------------------------------------------------------
// ,-------------------,
// | Word Details Page |
// '-------------------'

// links to current wikipedia revision
var links = page.getElementsByTagName('a');
var wikiregex = /(^\w+:\/\/\w+\.wikipedia\.org\/.*)\?oldid=\d+$/;
for (var l of links) {
    var match = l.href.match(wikiregex);
    if (match) l.href = match[1];
}

// -------------------------------------------------------------------------------
// ,-----,
// | Ads |
// '-----'

// move/remove sidebar ad
var sidebar = document.getElementById('secondary');
var sidebar_ad = sidebar && sidebar.querySelector('.search-results__sidebar-ad');
if (sidebar_ad) {
    sidebar_ad.remove();
    if (!REMOVE_ADS) sidebar.appendChild(sidebar_ad);
}

// remove footer ad
if (REMOVE_ADS) {
    var footer_ad = document.querySelector('.footer-ad');
    footer_ad && footer_ad.remove();
}

// -------------------------------------------------------------------------------
// ,-------,
// | Kanji |
// '-------'

var kanjiDetails = Array.from(document.getElementsByClassName("kanji details"));
for (var i=0; i<kanjiDetails.length; ++i) {
    var kanjiDiv = kanjiDetails[i];
    var kanji = kanjiDiv.getElementsByClassName('character')[0].innerText;

    var kanjiDefnDiv = document.querySelectorAll(
        "#result_area>.kanji.details>.row:first-of-type>.columns:last-of-type"
    )[i];

    // inline list of links
    var inlineList = kanjiDiv.getElementsByClassName("inline-list")[0];
    var inlineLinks = Array.from(inlineList.children);

    // add custom items
    var li_similar = document.createElement("li");
    var new_a = document.createElement("a");
    // new_a.href = `http://similarity.gakusha.info/?kanji=${kanji}`;
    new_a.href = `https://thekanjimap.com/index.html?k=${kanji}`;
    new_a.innerText = `Similar to ${kanji}`;
    li_similar.appendChild(new_a);
    inlineList.appendChild(li_similar);

    // dropdown list of links
    var dropdownList = document.getElementsByClassName("f-dropdown")[i];
    var dropdownLinks = Array.from(dropdownList.children);

    // move items from dropdown-list to inline list
    dropdownLinks.forEach(e=>inlineList.appendChild(e));
    // remove dropdown list and its link in the inline list
    inlineLinks.find(e=>e.textContent.match(/external links/i)).remove();
    dropdownList.remove();
}
