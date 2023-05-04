// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────╮
// │ MODULE dnd │
// ╰────────────╯

const dndb = {

    _site: "dndbeyond.com",

    follow: async function(switches="-J") {
        return hints.follow({
            switches: switches,
            extraSelectors: [
                ".collapsible-header",
                ".ddbc-tab-list__nav-item",
                ".ddbc-collapsible",
                "#open-indicator",
                ".list-row-indicator",
                ".class-spell-list-header",
                ".ddb-market-checkout-form-address-same-input",
                ".ddb-search-filter-item-wrapper",
                ".dice_notification_control",
                ".dice-toolbar--hover dice-toolbar__dropdown-die",
                "span.ct-sidebar__control",
            ]
        });
    },

    getContentGroup: async function(elt) {
        const section = elt.firstChild.firstChild.firstChild.getAttribute("data-testid");
        const itemElts = [...elt.children[1].getElementsByClassName("ct-inventory-item")];
        const items = itemElts.map(e=>e.getAttribute("data-testid"));
        return [section, items];
    },

    getClsNum: function(cls="") {
        const table = {
            "": "",
            1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 252717:252717,
            "artificer": 252717,
            "bard": 1,
            "cleric": 2,
            "druid": 3,
            "paladin": 4,
            "ranger": 5,
            "sorcerer": 6,
            "warlock": 7,
            "wizard": 8,
        };
        return table[cls];
    },

    gotoSpellLvlCls: async function(lvl, cls="") {
        lvl ??= "";
        const clsNum = this.getClsNum(cls);
        const clsFilter = `filter-class=${clsNum}`;
        const lvlFilter = `filter-level=${lvl}`;
        const url = `https://www.dndbeyond.com/spells?${clsFilter}&${lvlFilter}`;
        return tri.controller.acceptExCmd(`toposu! ${url}`);
    },

    spellUrl: async function(name, opts={}) {
        name = name.trim();
        const firstLetter = name[0];
        const id = S.toTitleCase(name).replace(/ +/g, "");
        return `https://www.dndbeyond.com/sources/phb/spell-descriptions-c#${id}`;
    },

    yankContentGroup: async function(elt) {
        const [section, items] = await this.getContentGroup();
        cutils.yank(`${section}:\n${items.join("\n")}`);
    },

};
sites.dndb = dndb;

sites.LISTS.dnd_sites = [
    "https://www.dndbeyond.com/characters",
    "https://rpgbot.net/dnd5/",
];
