// ╭────────────╮
// │ MODULE art │
// ╰────────────╯
var art = {};

// ╭──────────────╮
// │ Cultpens.com │
// ╰──────────────╯

art.cult = {
    nItems: function() {
        if (tri.contentLocation.href.match("https://www.cultpens.com/basket")) {
            const total = sum($$(".ks-product-qty").map(e=>e.value));
            const distinct = $$("tr.basket-item").length;
            return [total, distinct];
        } else {
            return $$("tr[id|=wishlist]").length;
        }
    },

    nItemsShow: function() {
        const nitems = cutils.asArr(this.nItems());
        const s = `number of items: ${nitems[0]}` + (nitems.length>1 ? ` (${nitems[1]} distinct)` : "");
        cutils.message(s, true);
 },

    title: () => $1("div.product-name>h1").firstChild.textContent.trim(),

    totalCost: function() {
        if (tri.contentLocation.href.match("https://www.cultpens.com/basket")) {
            return $1("div.grand-total>span[ge-data-converted-price]").getAttribute("ge-data-converted-price");
        } else {
            return sum($$("td.basket-item-price>i").map(e=>e.getAttribute("ge-data-converted-price"))).toFixed(2);
        }
    },


};

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────╮
// │ JacksonsArt.com │
// ╰─────────────────╯

art.ja = {
    cart: {
        count: function() {
            const elts = $$("input[title='Qty']");
            return elts.length && elts.map(e=>Number(e.value)).reduce((n,s)=>n+s);
        },
        countMatching: function(rx) {
            return this.filterItems(rx).length;
        },
        countMatchingWr: function(args) {
            /* TODO: allow regex with readStringOrRegex() */
            const rx = parseArgs(args, "string");
            const n = this.countMatching(rx);
            return cutils.message(`Items matching ${rx}: ${n}`, true);
        },
        filterItems: function(rx) {
            const items = this.getItems();
            /* string filters use smartcase */
            if (typeof rx == "string" && rx.toLowerCase() == rx) {
                return items.filter(
                    r => $1("td.product-name-section", r)?.textContent.toLowerCase().match(rx.toLowerCase())
                );
            } else {
                return items.filter(r=>$1("td.product-name-section",r)?.textContent.match(rx));
            }
        },
        formatRow: function(r) {
            const name = $1("h2.product-name", r).textContent.trim().replace(/\s+/g, " ");
            const unitPrice = $1("td.product-name-section+td>span.cart-price", r).textContent.trim();
            const qty = $1("input", r).value.trim();
            const price = $1("td.a-center+td>span.cart-price", r).textContent.trim();
            return `${name} - ${unitPrice} × ${qty} = ${price}\n`;
        },
        getItems: function() {
            return $$("#shopping-cart-table>tbody>tr");
        },
        getItemNames: function() {
            return $$("#shopping-cart-table>tbody>tr>td>.product-name").map(e=>e.innerText.replace(/\s+/, " "));
        },
        hint_yankName: async function() {
            return hint(
                "h2.product-name>a",
                "-F", "e=>cutils.yank(e.textContent).replace(/\s+/g, ' ')"
            );
        },
        itemURLs: function() {
            return $$(".cart .product-name>a").map(e=>e.href);
        },
        /** removeItems(rx): Remove items from cart. Select with rofi after filtering with regex RX
            note: only a single item is guaranteed to be removed.
         */
        removeItems: async function(rx, opts={}) {
            const items = this.getItems();
            const selectedIdxs = await cutils.select(
                items.map(r=>$1("h2.product-name>a", r)?.textContent.trim()).filter(r=>r.match(rx||/./)),
                { format: "i", multiSelect: opts.multi, }
            );
            for (const i in selectedIdxs) {
                if (i=>!isNaN(i)) $1(".js-basket-remove", items[i]).click();
            }
        },
        total: function() {
            const s = $1t("td", /total due/i).nextElementSibling.textContent.trim();
            return Number(s.match(/\$(\d+\.\d\d)/)[1]);
        },
        yankItems: function(re=/./) {
            return cutils.yank(this.filterItems(re).map(r=>this.formatRow(r)));
        },
        yankURLs: function(re=/./) {
            return cutils.yank(this.filterItems(re).map(e=>$1("h2.product-name>a", e).href).join("\n"));
        },
        yankNames: function(re=/./) {
            return cutils.yank(
                this.filterItems(re).map(e=>$1(".product-name>a", e).textContent.replace(/\s+/g, " ")).join("\n")
            );
        },
    },

    count: function() {
        const url = tri.contentLocation.href;
         if (url.includes("/checkout/cart/")) {
             return this.cart.count();
        } else {
            return $$("img.is--grid")?.length ??
                $$("#universal-grid__table>tbody>tr>td>a")?.length ??
                $$("li.item>.product-line")?.length;
        }
    },

    go: async function(count=null) {
        const url = tri.contentLocation.href;
        if (url.includes("/sales/order/history/")) {
            const dest = $1t("#my-orders-table>tbody>tr.first a", "View Order").href+"#main-menu";
            if (count) tabopen(dest); else open(dest);
        } else if (url.includes("/checkout/cart/")) {
            cutils.click("button", "Proceed to Checkout");
        } else {
            hint("-J", "img.is--grid,#universal-grid__table>tbody>tr>td>a,li.item>.product-line");
        }
    },

    hint_yank_sku: function() {
        if ($1("#shopping-cart-table>tbody>tr")) {
            return hint(
                "#shopping-cart-table>tbody>tr",
                "-F", "e=>cutils.yank(e.querySelector('small')?.textContent)"
            );
        } else if ($1("#universal-grid__table>tbody>tr")) {
            return hint(
                "#universal-grid__table>tbody>tr",
                "-F", "e=>cutils.yank(e.querySelector('td.hidden-xs:nth-child(3)').textContent)"
            );
        } else if ($1("li.async--grid__element")) {
            return hint(
                "li.async--grid__element",
                "-F", "e=>cutils.yank(e.getAttribute('data-skus'))"
            );
        } else if ($1("li.item")) {
            return hint(
                "li.item,.product-shop",
                "-F",
                "e=>cutils.yank((" +
                    "    e.querySelector('p[itemprop=sku]') || " +
                    "    e.querySelector('.product-description>p:first-child')" +
                    ").textContent)"
            );
        } else return "";
    },

    toggleOption(option) {
        return $$("a.media-flex.filter__option>span").find(e=>e.textContent.match(option)).parentElement.click();
    },
    toggleOptionWr: function(args) {
        option = cutils.tri.parseArgs(args, "string");
        return this.toggleOption(option);
    },

    yank: function() {
        const url = tri.contentLocation.href;
        if (url.match("checkout/cart")) return this.cart.yankNames();
        else if (url.match("/search/?")) return cutils.yank((new URL(url)).searchParams.get("q"));
        else return cutils.yank($1(".product-name>h1").textContent);
    }
};

window.art = art;
