// ==UserScript==
// @name        DnDBeyond Warlock Improvements
// @namespace   https://github.com/troyp
// @match       https://www.dndbeyond.com/classes/warlock
// @grant       none
// @version     1.0
// @author      Troy Pracy
// @description 05/06/2022, 9:25:59 pm
// ==/UserScript==

const ul = document.querySelector(".quick-menu-tier-2");
const features_li = document.getElementById("ClassFeatures");
const features_sublinks = {
    "Pact Magic":            "PactMagic-387",
    "Eldritch Invocations":  "EldritchInvocations-388",
    "Pact Boon":             "PactBoon-389",
    "Mystic Arcanum":        "MysticArcanum(6thlevel)-390",
    "Eldritch Master":       "EldritchMaster-391",
};
var current = features_li;
Object.keys(features_sublinks).forEach(title => {
    const id = features_sublinks[title];
    const li = document.createElement("li");
    li.innerHTML = `
    <div class="quick-menu-item-label" style="scroll-behavior: unset;">
      <a class="quick-menu-item-link" href="#${id}" style="scroll-behavior: unset;">
        ${title}
      </a>
     </div>
  `;
    current.after(li);
    current = li;
});
