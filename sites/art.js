// ╭────────────╮
// │ MODULE art │
// ╰────────────╯

sites.LISTS.art_sites = [
    "jacksonsart.com",
];

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────╮
// │ JacksonsArt.com │
// ╰─────────────────╯
const ja = {

    _site: "jacksonsart.com",

    gotoShippingInfo: async function(where="related") {
        return utils.tab.openAndRun(
            "https://www.jacksonsart.com/en-au/shipping-info",
            ()=>tri.controller.acceptExCmd(`artjs art.ja.showShippingInfo()`),
            where
        );
    },

};

sites.ja = ja;
