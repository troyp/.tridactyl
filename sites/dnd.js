const dndb = {

        _site: "dndbeyond.com",

        follow: async function() {
            return hints.follow({
                switches: "-J",
                extraSelectors: [
                    ".collapsible-header",
                    ".ddbc-tab-list__nav-item",
                    "#open-indicator",
                    ".list-row-indicator",
                    ".class-spell-list-header",
                    ".ddb-market-checkout-form-address-same-input",
                    ".ddb-search-filter-item-wrapper",
                    ".dice_notification_control",
                    ".dice-toolbar--hover dice-toolbar__dropdown-die",
                ]
            });
        },

        getContentGroup: async function(elt) {
            const section = elt.firstChild.firstChild.firstChild.getAttribute("data-testid");
            const itemElts = [...elt.children[1].getElementsByClassName("ct-inventory-item")];
            const items = itemElts.map(e=>e.getAttribute("data-testid"));
            return [section, items];
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
