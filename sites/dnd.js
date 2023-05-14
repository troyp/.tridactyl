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

    getClsNum: function(cls="") {
        const table = {
            "": "",
            "-": "",
            1:1, 2:2, 3:3, 4:4, 5:5, 6:6, 7:7, 8:8, 252717:252717,
            "1":1, "2":2, "3":3, "4":4, "5":5, "6":6, "7":7, "8":8, "252717":252717,
            "artificer": 252717,
            "bard": 1,
            "cleric": 2,
            "druid": 3,
            "paladin": 4,
            "ranger": 5,
            "sorcerer": 6,
            "warlock": 7,
            "wizard": 8,
            "b": 1,
            "c": 2,
            "d": 3,
            "p": 4,
            "r": 5,
            "s": 6,
            "k": 7,
            "w": 8,
        };
        return table[cls];
    },

    getSpellFilter(tag) {
        const table = {
            "verbal": "verbal=t", "noverbal": "verbal=f",
            "somatic": "somatic=t", "nosomatic": "somatic=f",
            "material": "material=t", "nomaterial": "material=f",
            "conc": "concentration=1", "noconc": "concentration=2",
            "ritual": "ritual=t", "noritual": "ritual=f",
            "abjuration": "school=3",
            "conjuration": "school=4",
            "divination": "school=5",
            "enchantment": "school=6",
            "evocation": "school=7",
            "illusion": "school=8",
            "necromancy": "school=9",
            "transmutation": "school=10",
            "melee": "attack-type=1", "ranged": "attack-type=2",
            "creation": "tags=1",
            "heal": "tags=2", "healing": "tags=2",
            "teleport": "tags=4", "teleportation": "tags=4",
            "control": "tags=6",
            "communication": "tags=10",
            "social": "tags=12",
            "debuff": "tags=13",
            "scry": "tags=14", "scrying": "tags=14",
            "detect": "tags=15", "detection": "tags=15",
            "banish": "tags=16", "banishment": "tags=16",
            "move": "tags=17", "movement": "tags=17",
            "utility": "tags=19",
            "environment": "tags=20",
            "explore": "tags=21", "exploration": "tags=21",
            "combat": "tags=22",
            "shapechange": "tags=23", "shapechanging": "tags=23",
            "deception": "tags=24",
            "foreknowledge": "tags=25",
            "warding": "tags=26",
            "compulsion": "tags=66",
            "charm": "tags=108", "charmed": "tags=108",
            "special": "tags=187",
            "psi": "tags=301", "psionic": "tags=301",
            "dunamancy": "tags=326",
        };
        return table[tag];
    },

    gotoSpellLvlCls: async function(lvl, cls="", other="") {
        lvl ??= "";
        if (lvl=="-") lvl = "";
        const lvls = lvl.split(",");
        const lvlFilter = lvls.map(l=>`filter-level=${l}`).join("&");
        const clss = cls.split(",");
        const clsFilter = clss.map(c=>{
            const clsNum = this.getClsNum(c);
            return `filter-class=${clsNum}`;
        }).join("&");
        const others = other.split(",");
        const otherFilter = others.map(x=>`&filter-${this.getSpellFilter(x)}`).join("");
        const sort = "sort=level";
        const url = `https://www.dndbeyond.com/spells?${clsFilter}&${lvlFilter}${otherFilter}&${sort}`;
        return tri.controller.acceptExCmd(`toposu! ${url}`);
    },

    spellUrl: async function(name, opts={}) {
        name = name.trim();
        const firstLetter = name[0];
        const id = S.toTitleCase(name).replace(/ +/g, "");
        return `https://www.dndbeyond.com/sources/phb/spell-descriptions-c#${id}`;
    },

};
sites.dndb = dndb;

sites.LISTS.dnd_sites = [
    "https://www.dndbeyond.com/characters",
    "https://rpgbot.net/dnd5/",
];
