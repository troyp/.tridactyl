csites = {
    archive: {
        _site: "archive.org",

        toggleToolbarURL: function() {
            urls.mod.togglepage(
                "id_/http",
                "/http",
                "id_\/http(?=s?:)",
                "(?<!_)\/http(?=s?:)",
            );
        },
    },

    e: {
        _site: "ebay.com.au",

        getStoreURL: function() {
            const storelink = $1("#storeSeller>div>a") || $1t("a", "Visit store") || $1t("a", "See other items");
            return storelink?.href;
        }
    },

    ramda: {
        filterCategory: function(cat) {
            this.restore();
            cutils.hide(
                "section.card",
                { filter: card => $1("span.label-category", card).textContent !== cat, }
            );
            cutils.hide(
                "ul.toc>li",
                { filter: li => li.querySelector("span.label-category").getAttribute("data-category") !== cat, }
            );
        },

        restore: function() {
            cutils.unhide("section.card");
            cutils.unhide("ul.toc>li");
        },

    },
}
