const links = {
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

    dlChooseLinks: async function(links, opts={}) {
        opts = cutils.tri.parseOpts(
            opts, {
                defaults: { dir: "~/Downloads", max: 160, },
                nullishDefaults: { title: "ff_downloads", }
            }
        );
        const newdir = `${opts.dir}/${opts.title}`;
        await tri.native.run(`mkdir -p "${newdir}"`);
        const rofiRes = await cutils.select(
            links, {
                multiSelect: true,
                format: "i",
                prompt: "Links to download",
            }
        );
        const chosen = rofiRes.map(i=>links[Number(i)]);
        const urls = chosen.map(l => l?.href || "").filter(e=>e);
        urls.forEach(async u => {
            await tri.controller.acceptExCmd(`js -r shell.js`);
            const uq = shell.singQEscape(u);
            tri.native.run(`wget -pP ${newdir} -e robots=off '${(uq)}'`);
        });
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
