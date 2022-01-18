links = {
    append: function() {
        return this.appendLines(
            document.links,
            {
                transform: l=>`<a href=${l.href}>${decodeURIComponent(l.href)}</a>`,
                filter: l=>l?.href!=="" && l?.textContent?.trim()!=="",
                heading: "LINKS",
            }
        );
    },

    appendAsMarkdown: function() {
        return this.appendLines(
            document.links,
            {
                transform: l=>`[${l.textContent}](${decodeURIComponent(l.href)})`,
                filter: l=>l?.href!=="" && l?.textContent?.trim()!=="",
                heading: "LINKS (markdown)",
            }
        );
    },

    appendLines: function(selector, opts={}) {
        opts = cutils.tri.parseOpts(
            opts,
            {
                defaults: { transform: "textContent", filter: e=>e, },
                nullishDefaults: { heading: "FOOTNOTES" },
            }
        );
        const transform = (typeof opts.transform == "string")
            ? (e=>e[opts.transform])
            : opts.transform;
        const elts = typeof selector == "string"
              ? $$(selector)
              : [...selector];
        const linkHtml = elts
              .map(transform)
              .filter(opts.filter)
              .join("<br>");
        return document.body.insertAdjacentHTML(
            "beforeend",
            this.mkAppendHtml(opts.heading, linkHtml)
        );
    },

    appendWithText: function() {
        return this.appendLines(
            document.links,
            {
                transform: l => `${l.textContent} --- <a href=${l.href}>${decodeURIComponent(l.href)}</a>`,
                filter: l=>l?.href!=="" && l?.textContent?.trim()!=="",
                heading: "LINKS",
            }
        );
    },

    mkAppendHtml(title, htmlstr) {
        return `
          <br style=clear:both;>
          <div>
            <hr>
            <h2 style=text-align:center;>${title}</h2>
            <hr>
            ${htmlstr}
          </div>
          <hr>`;
    },

    selected: () => [...cutils.getSelectionDOM().links],

    yankAll: function() { return cutils.yank([...document.links].map(e=>e.href).join("\n")); },

    yankSelected: function() { return cutils.yank(this.selected().map(e=>e.href).join("\n")); },

};
