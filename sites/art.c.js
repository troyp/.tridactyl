// ╭────────────╮
// │ MODULE art │
// ╰────────────╯
art = {};

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

        itemURLs: function() {
            return $$(".cart .product-name>a").map(e=>e.href);
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

    go: async function(count=null) {
        const url = tri.contentLocation.href;
        if (url=="https://www.jacksonsart.com/en-au/sales/order/history/") {
            const dest = $1t("#my-orders-table>tbody>tr.first a", "View Order").href+"#main-menu";
            if (count) tabopen(dest); else open(dest);
        } else if (url=="https://www.jacksonsart.com/en-au/checkout/cart/") {
            cutils.click("button", "Proceed to Checkout");
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

};
