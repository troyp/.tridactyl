// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────╮
// │ MODULE dnd │
// ╰────────────╯

var dnd = {};

dnd.dandw = {
    filter5e: async function() {
        rm("#mw-pages li", { filter: e=>!e.textContent.match(/\(5e Optimized Character Build\)/) });
        rm("#mw-pages .mw-category-group", { filter: e=>e.querySelector("ul").childElementCount==0 });
    },
};

dnd.dndb = {
    getContentGroup: async function(elt) {
        const section = elt.firstChild.firstChild.firstChild.getAttribute("data-testid");
        const itemElts = [...elt.children[1].getElementsByClassName("ct-inventory-item")];
        const items = itemElts.map(e=>e.getAttribute("data-testid"));
        return [section, items];
    },

    go: async function() {
        const url = tri.contentLocation.href;
        if (url.match(/https:\/\/www\.dndbeyond\.com\/characters\/\d*\/builder\//)) {
            hint("-Jc", ".builder-sections a", "-F", "e=>open(e.href.replace(/^help/, 'manage'))");
        } else if (url.match(/https:\/\/www\.dndbeyond\.com\/characters\//)) {
            tri.controller.acceptExCmd(`js -r sites/dndb.auto.js`);
            hint(
                "-Jc",
                ".integrated-dice__container,.dice-toolbar__dropdown-die,.dice-die-button,button.MuiButton-root"
            );
        } else if ($1(".open-indicator")) {
            hint("-Jc", ".open-indicator");
        } else if ($1(".list-row-indicator")) {
            hint("-Jc", ".list-row-indicator");
        } else if ($1(".listing-card__callout")) {
            hint("-Jc", ".listing-card__callout", "-F e=>tabopen(e.closest('a'))");
        } else if ($1(".homebrew-comments")) {
            rm(".homebrew-comments");
        } else {
            $$("h2").find(h=>window.scrollY>h.offsetTop).scrollIntoView();
        }
    },

    tableSplitDamageCol: async function(table) {
        const headerRow = table.getElementsByTagName("thead")[0].children[0];
        const index = [...headerRow.children].findIndex(c=>c.textContent=="Damage");
        headerRow.children[index].outerHTML = "<td><p>Damage</p></td><td><p>Type</p></td>";

        const bodyRows = [...table.getElementsByTagName("tbody")[0].children];
        bodyRows.forEach(row=>{
            const col = row.children[index];
            if (col) {
                const [amount, type] = col.textContent.split(/ +/g);
                col.outerHTML=`<td><p>${amount}</p></td><td><p>${type}</p></td>`;
            }
        });
    },


    toggle: async function() {
        const url = tri.contentLocation.href;
        if (url.match(/https:\/\/www\.dndbeyond\.com\/spells/)) {
            $$("#open-indicator").forEach(e=>e.click());
        } else if (url.match(/https:\/\/www\.dndbeyond\.com\/characters/)) {
            $$(".collapsible>.collapsible-header").forEach(e=>e.click());
        } else {
            hint("-!JVc", ".listing-body .list-row-indicator");
        }
    },

    toggleOn: async function() {
        const url = tri.contentLocation.href;
        if (url.match(/https:\/\/www\.dndbeyond\.com\/spells/)) {
            $$("#open-indicator.plus").forEach(e=>e.click());
        } else if (url.match(/https:\/\/www\.dndbeyond\.com\/characters/)) {
            $$(".collapsible-closed>.collapsible-header").forEach(e=>e.click());
        } else {
            hint("-!JVc", ".listing-body .list-row-indicator.closed");
        }
    },

    toggleOff: async function() {
        const url = tri.contentLocation.href;
        if (url.match(/https:\/\/www\.dndbeyond\.com\/spells/)) {
            $$("#open-indicator.minus").forEach(e=>e.click());
        } else if (url.match(/https:\/\/www\.dndbeyond\.com\/characters/)) {
            $$(".collapsible-opened").forEach(e=>e.click());
        } else {
            hint("-!JVc", ".listing-body>.collapsible-header .list-row-indicator.open");
        }
    },

    yankContentGroup: async function(elt) {
        const [section, items] = await this.getContentGroup(elt);
        cutils.yank(`${section}:\n${items.join("\n")}`);
    },
};

window.dnd = dnd;
