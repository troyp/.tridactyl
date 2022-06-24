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

    dndb: {
        csheet: {
            roll: function() {
                hint("-Jc", ".integrated-dice__container");
            },
        },

        go: async function() {
            const url = tri.contentLocation.href;
            if (url.match(/https:\/\/www\.dndbeyond\.com\/characters\//)) {
                tri.controller.acceptExCmd(`js -r sites/dndb.auto.js`);
                hint("-Jc", ".integrated-dice__container");
            } else if ($1(".open-indicator")) {
                hint("-Jc", ".open-indicator");
            } else if ($1(".list-row-indicator")) {
                hint("-Jc", ".list-row-indicator");
            } else if ($1(".homebrew-comments")) {
                cutils.rm(".homebrew-comments");
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
    },

    e: {
        _site: "ebay.com.au",

        getStoreURL: function() {
            const storelink = $1("#storeSeller>div>a") || $1t("a", "Visit store") || $1t("a", "See other items");
            return storelink?.href;
        }
    },

    j: {
        _site: "https://jisho.org",

        toggleLinksUL: function(ul) {
            ul.focus();
            var llstyle = ul.style;
            leftvalmatch = llstyle.cssText.match(/left: *(-?\d+\w*);/);
            if (leftvalmatch && parseInt(leftvalmatch[1])>-250) {
                ul.classList.remove("open");
                llstyle.cssText = "";
            } else {
                ul.classList.add("open");
                llstyle.cssText.replace(/left:[^;]+;/, "");
                // llstyle.cssText += " left: -220px;";
                llstyle.cssText += " left: 0px; background-color: rgba(255, 255, 255, 0.7);";
            }
        },
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

    tvtropes: {
        spoilers: function() {
            const style = { on:  "transparent", off: "rgb(51, 51, 51)", };
            const spoilers = $$(".spoiler");
            if (spoilers[0]?.style?.color == style.off)
                spoilers.forEach(e=>e.style.color = style.on);
            else
                spoilers.forEach(e=>e.style.color = style.off);
        },
    },

    wp: {
        _site: "wikipedia.org",

        cleanup: function() {
            rmall(
                "#siteNotice", "#mw-navigation", "#footer", ".noprint", ".mw-editsection",
                ".navbox", "#xtools", "#kanjiInfo", "._added-by-script",
            );
        },

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
