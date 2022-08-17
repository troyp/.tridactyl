// ╭────────────╮
// │ D&D Beyond │
// ╰────────────╯

$$(".spell-list-heading-icon.i-concentration").forEach(e=>{
    const heading = e.closest(".spell-list-heading").querySelector(".spell-list-heading-text");
    heading.style.color = "#c53131";
});
$$(".spell-list-heading-icon.i-ritual").forEach(e=>{
    const box = e.closest(".collapsible-header");
    box.style.background = "#FFFCCB";
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

// -------------------------------------------------------------------------------
// ╭─────────────────╮
// │ Character Sheet │
// ╰─────────────────╯

if (document.location.href.match(/https:\/\/www.dndbeyond.com\/characters\/[0-9]+/)) {

    const typemap = {
        "fire": ["#f78c19", "#c52400", "#ffedcc"],
        "cold": ["lightSkyBlue", "black", "#b6e1fc"],
        "lightning": ["yellow", "#665700", "#ebedfd"],
        "thunder": ["lightSeaGreen", "black", "#bef4f1"],
        "necrotic": ["#fde4be", "#402503", "#fdf5e5"],
        "acid": ["chartreuse", "black", "#e6ffcc"],
        "poison": ["yellowGreen", "black", "#ebf5d6"],
        "psychic": ["pink", "deepPink", "#fff4f6"],
        "force": ["#ff00dd", "#730064", "#ffccff"],
        "radiant": ["#76f9ff", "#112425", "#e6eeff"],
        "Bludgeoning": ["#bdd8ff", "#0055ff", ""],
        "Piercing": ["gray", "red", ""],
        "Slashing": ["gray", "blue", ""],
        "Healing": ["white", "#cd282d", "#cd282d"],
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
