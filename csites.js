var csites = {
    amaz: {
        _site: "amazon.com",

        buy: function() {
            return cutils.click("input#turbo-checkout-pyo-button") ||
                cutils.click("#submitOrderButtonId>span>input") ||
                cutils.click("#buy-now-button");
        },

        fixRightCol: function() {
            cutils.css.addSheet("fixrightcol");
            cutils.css.addRules(
                "fixrightcol",
                [".rightCol", { float: "right", width: "244px", marginLeft: "20px", }]
            );
        },

        go: function() {
            return cutils.click("#add-to-cart-button") || cutils.click("input[name=proceedToRetailCheckout]");
        },

        next: function() {
            cutils.click("a.s-pagination-next") || cutils.click("a", /next/i);
        },
        previous: function() {
            cutils.click("a.s-pagination-previous") || cutils.click("a", /previous/i);
        },

    },

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

    coles: {
        _site: "coles.com.au",

        go: function() {
            tri.controller.acceptExCmd(`js -r personal/personal.js`);
            cutils.get1("span[role=text]", /log in.*signup/i).click();
            setTimeout(
                ()=>{
                    cutils.setInput("#login-email-input", user.email);
                    cutils.setInput("#login-password-input", user.passwords.coles);
                    $1("button.login-form-btn-submit").click();
                },
                500
            );
        },

    },

    e: {
        _site: "ebay.com.au",

        filterFreePostage: function() {
            const items = $$("li.s-item");
            const isFreePost = (item) => $1(".s-item__shipping", item)?.textContent.match(/free postage/i);
            items.filter(item=>!isFreePost(item)).forEach(item=>item.remove());
        },

        getStoreURL: function() {
            const storelink = $1("#storeSeller>div>a") || $1t("a", "Visit store") || $1t("a", "See other items");
            return storelink?.href;
        }
    },

    f: {
        baseURL: function(withProtocol=true) {
            const match = tri.contentLocation.href.match(/https?:\/\/([^./]+\.(wikia|fandom).com)/);
            return match?.[withProtocol?0:1];
        },
        search: function(s, opts={}) {
            s = cutils.tri.parseArgs(s, "str");
            opts = cutils.tri.parseOpts(opts, { castString: "where" });
            opts.where ||= "related";
            const baseurl = this.baseURL();
            return tri.excmds.jsb(
                `utils.tab.open('${baseurl}/wiki/Special:Search?query=${s}','${opts.where}')`
            );
        },
    },

    g: {
        _site: "google.com",

        go: async function() {
            const url = tri.contentLocation.href;

            /* GOOGLE IMAGES: append selected image source URL to clipboard */
            if (url.match("https://www.google.com/imgres?imgurl=") ||
                url.match(/https:\/\/www.google.com\/search\?.*#imgrc=/)) {
                const imgUrl = $1(
                    "body>div>c-wiz>div:nth-of-type(3)>div:nth-of-type(2)" +
                        ">div:nth-of-type(3)>div>div>div:nth-of-type(3)" +
                        ">div:nth-of-type(2)>c-wiz>div:first-of-type>div:first-of-type" +
                        ">div:first-of-type>div>div>a>img"
                ).src;
                const res = await cutils.cbAppend(imgUrl);
                return res;
            } else return null;
        },
    },

    gh: {
        _site: "https://github.com",

        getDescription: function() {
            return $1t(".BorderGrid-cell>h2", "About")?.nextElementSibling?.textContent.trim().replace(/\.$/, "");
        },

        getTitle: function() {
            return $1("article>h1")?.textContent.trim();
        },
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
};

window.csites = csites;
