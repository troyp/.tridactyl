// ╭────────────╮
// │ D&D Beyond │
// ╰────────────╯

$$(".spell-list-heading-icon.i-concentration").forEach(e=>{
    const heading = e.closest(".spell-list-heading").querySelector(".spell-list-heading-text");
    if (heading) heading.style.color = "#c53131";
});
$$(".spell-list-heading-icon.i-ritual").forEach(e=>{
    const box = e.closest(".collapsible-header");
    if (box) box.style.background = "#FFFCCB";
});

$$("span.spell-list-heading-text").forEach(e=>{
    const title = e.textContent;
    const s = title.toLowerCase().replace(/ /g, "-");
    const a = document.createElement("a");
    a.href = `https://www.dndbeyond.com/spells/${s}`;
    a.innerText = title;
    e.childNodes[0].remove();
    e.appendChild(a);
});

// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────────╮
// │ Character Builder │
// ╰───────────────────╯

$$(".builder-sections a").forEach(l => {
    l.href = l.href.replace(/help$/, "manage");
});

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────╮
// │ Character Sheet │
// ╰─────────────────╯

if (document.location.href.match(/https:\/\/www.dndbeyond.com\/characters\/[0-9]+/)) {

    const csheet_inner = document.querySelector(".ct-character-sheet__inner");
    if (csheet_inner) csheet_inner.style.marginLeft="6em";

    const typemap = {
        "fire": ["#f78c19", "#c52400", "rgba(247, 140, 25, 0.2)"],
        "cold": ["lightSkyBlue", "black", "rgba(135, 206, 250, 0.2)"],
        "lightning": ["yellow", "#665700", "rgba(255, 255, 0, 0.2)"],
        "thunder": ["lightSeaGreen", "black", "rgba(32, 178, 170, 0.2)"],
        "necrotic": ["#fde4be", "#402503", "rgba(253, 228, 190, 0.2)"],
        "acid": ["chartreuse", "black", "rgba(255, 87, 51, 0.2)"],
        "poison": ["yellowGreen", "black", "rgba(154, 205, 50, 0.2)"],
        "psychic": ["pink", "deepPink", "rgba(255, 192, 203, 0.2)"],
        "force": ["#ff00dd", "#730064", "rgba(255, 0, 221, 0.2)"],
        "radiant": ["#76f9ff", "#112425", "rgba(255, 0, 221, 0.2)"],
        "Bludgeoning": ["#bdd8ff", "#0055ff", ""],
        "Piercing": ["gray", "red", ""],
        "Slashing": ["gray", "blue", ""],
        "Healing": ["white", "#cd282d", "rgb(200, 50, 50)"],
    };

    $$("svg.ddbc-damage-type-icon__img").forEach(e=>{
        const button = e.closest("button");
        const type = e.parentElement.getAttribute("data-original-title") ||
              e.parentElement.parentElement.parentElement.getAttribute("data-original-title");
        if (type && typemap[type]) {
            const [fillcolor, strokecolor, bgcolor] = typemap[type];
            if (button) {
                button.style.backgroundColor = bgcolor;
                button.style.borderColor = strokecolor;
                button.style.borderWidth = "1px";
            }
            if (type && ["force", "necrotic"].includes(type)) {
                [...e.children].forEach(c=>{
                    c.setAttribute("fill", fillcolor);
                    c.setAttribute("stroke", strokecolor);
                });
            } else {
                e.firstChild.setAttribute("fill", fillcolor);
                e.firstChild.setAttribute("stroke", strokecolor);
            }
        }
    });

    $$("svg.ddbc-healing-icon__icon").forEach(e=>{
        const button = e.closest("button");
        const [fillcolor, strokecolor, bgcolor] = typemap["Healing"];
        e.firstChild.setAttribute("fill", fillcolor);
        e.firstChild.setAttribute("stroke", strokecolor);
        if (button) {
            button.style.color = "white";
            button.style.backgroundColor = bgcolor;
            button.style.borderColor = strokecolor;
        }
    });

};
