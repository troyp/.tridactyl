// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────╮
// │ MODULE dnd │
// ╰────────────╯

const dnd = {
    gdrive: "https://drive.google.com/drive/folders/118Rgv-J4jW5boTab-wX14cwFsVGGeSrH",
    dprcalc: "https://docs.google.com/spreadsheets/d/10clHkMM3Y7NxsZh9o3UMqnB9AdeSlzxNqF0sxx0NL-I/edit#gid=0",
};
sites.dnd = dnd;

const dndb = {

    _site: "dndbeyond.com",

    OWNED: [
        1, 2, 3, 4, 5, 13, 27, 28, 38, 44, 49, 54, 57, 59, 60, 61, 66, 67, 69, 80, 81, 85, 89, 90, 91, 93,
        101, 104, 111
    ],
    ownedFilter: function() {
        return this.OWNED.map(k=>`filter-source=69&filter-source=${k}`).join("&");
    },

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
                "div.special-select-item",
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
            /* components */
            "verbal": "verbal=t", "noverbal": "verbal=f",
            "somatic": "somatic=t", "nosomatic": "somatic=f",
            "material": "material=t", "nomaterial": "material=f",
            "v": "verbal=t", "no-v": "verbal=f",
            "s": "somatic=t", "no-s": "somatic=f",
            "m": "material=t", "no-m": "material=f",
            /* concentration */
            "conc": "concentration=1", "noconc": "concentration=2",
            /* ritual */
            "ritual": "ritual=t", "noritual": "ritual=f",
            /* casting time */
            "action": "casting-time=1",
            "ba": "casting-time=2",
            "reaction": "casting-time=3",
            "min": "casting-time=4", "1min": "casting-time=4",
            "10min": "casting-time=5",
            "hr": "casting-time=6", "1hr": "casting-time=6",
            "8hr": "casting-time=7",
            "12hr": "casting-time=8",
            /* school */
            "abjuration": "school=3",
            "conjuration": "school=4",
            "divination": "school=5",
            "enchantment": "school=6",
            "evocation": "school=7",
            "illusion": "school=8",
            "necromancy": "school=9",
            "transmutation": "school=10",
            /* attack type */
            "melee": "attack-type=1", "ranged": "attack-type=2",
            /* damage type */
            "acid": "damage-type=48",
            "bludgeoning": "damage-type=49",
            "cold": "damage-type=50",
            "fire": "damage-type=51",
            "force": "damage-type=52",
            "lightning": "damage-type=53",
            "necrotic": "damage-type=54",
            "piercing": "damage-type=55",
            "poison": "damage-type=56",
            "psychic": "damage-type=57",
            "radiant": "damage-type=58",
            "slashing": "damage-type=59",
            "thunder": "damage-type=60",
            /* save */
            "str": "save-required=1",
            "dex": "save-required=2",
            "con": "save-required=3",
            "int": "save-required=4",
            "wis": "save-required=5",
            "cha": "save-required=6",
            "save": "save-required=1&filter-save-required=2&filter-save-required=3&filter-save-required=4"
                + "&filter-save-required=5&filter-save-required=6",
            /* conditions */
            "blinded" : "condition=1",
            "charmed" : "condition=2",
            "deafened" : "condition=3",
            "exhausted" : "condition=4",
            "frightened" : "condition=5",
            "grappled" : "condition=6",
            "incapacitated" : "condition=7",
            "invisible" : "condition=8",
            "paralyzed" : "condition=9",
            "petrified" : "condition=10",
            "poisoned" : "condition=11",
            "prone" : "condition=12",
            "restrained" : "condition=13",
            "stunned" : "condition=14",
            "unconscious" : "condition=15",
            /* sort */
            "sort=cast": "sort=casting-time",
            "sort=-cast": "sort=-casting-time",
            "sort=duration": "sort=spell-duration",
            "sort=-duration": "sort=-spell-duration",
            /* tags */
            "creation": "tags=1",
            "heal": "tags=2", "healing": "tags=2",
            "teleport": "tags=4", "teleportation": "tags=4",
            "damage": "tags=5", "dmg": "tags=5",
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
            "charm": "tags=108", "tag=charmed": "tags=108",
            "special": "tags=187",
            "psi": "tags=301", "psionic": "tags=301",
            "dunamancy": "tags=326",
        };
        if (tag.startsWith("q="))
            return tag.replace(/^q=/, "search=");
        else
            return table[tag] || tag;
    },

    gotoSpell: function(s, opts={}) {
        s = utils.tri.parseArgs(s, "array");
        opts = utils.tri.parseOpts(opts, {
            defaults: { where: "tab"},
            castString: "where",
            castBoolean: "nogoto",
        });
        const spell = s.join(`-`).toLowerCase().replace(/'/g, ``).replace(/\//g, '-');
        const url = `https://www.dndbeyond.com/spells/${spell}`;
        if (!opts.nogoto) utils.tab.open(url, opts.where);
        return url;
    },

    gotoSpellLvlCls: async function(lvl, cls="", other="") {
        /* level */
        lvl ??= "";
        if (lvl=="-") lvl = "";
        let lvls = [];
        lvl.split(",").forEach(s=>{
            let match = s.match(/(\d+)-(\d+)/);
            if (match) {
                let beg = match[1];
                let end = match[2];
                lvls = lvls.concat(tri.R.range(parseInt(beg), parseInt(end)+1));
            } else
                lvls.push(s);
        });
        const lvlFilter = lvls.map(l=>`filter-level=${l}`).join("&");
        /* class */
        const clss = cls.split(",");
        const clsFilter = clss.map(c=>{
            const clsNum = this.getClsNum(c);
            return `filter-class=${clsNum}`;
        }).join("&");
        /* other filters */
        const others = other.split(",");
        const [sorts, filters] = tri.R.partition(s=>s.match("sort="), others);
        const filterstr = filters.map(x=>`&filter-${this.getSpellFilter(x)}`).join("");
        const sortstr = sorts.length>0 ? sorts.map(this.getSpellFilter).join("") : "sort=level";
        /* assemble URL */
        const url = `https://www.dndbeyond.com/spells?${clsFilter}&${lvlFilter}${filterstr}&${sortstr}`;
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
