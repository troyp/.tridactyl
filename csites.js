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

    se: {
        widen: function() {
            const cssrules = [
                ["#sidebar", "display: none;"],
                ["#left-sidebar", "display: none;"],
                ["#mainbar", "width: 1200px;"],
            ];
            cutils.css.toggleOrCreate("_tri_widen", ...cssrules);
        },
    },

    wp: {
        _site: "wikipedia.org",

        toggleJa: function() {
            const url = location.href;
            if (/^https:\/\/en/.test(location.href)) {
                location.replace($1t(".interlanguage-link", "日本語").firstChild.href);
            } else {
                location.replace($1t(".interlanguage-link", "English").firstChild.href);
            }
        },
    },
}
