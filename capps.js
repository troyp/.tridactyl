// ╭────────────────────────────────────────────────────────────╮
// │ capps.js -- Content Script Application code for .tridactyl │
// ╰────────────────────────────────────────────────────────────╯

capps = {

    rofi: async function(items, opts={}) {
        opts.format ||= "i";
        opts.prompt ||= "Choose entry: ";
        const dmenuInput = items.join("\n");
        const cmd = `dmenuin="$(cat <<'EOF'\n${dmenuInput}\nEOF\n)"; echo "$dmenuin" | ` +
              `rofi -dmenu -width 80 -format ${opts.format} -p "${opts.prompt}" -multi-select -i`;
        return tri.native.run(cmd).then(
            res => res.content //.trim().split("\n").map(d=>parseInt(d))
        );
    },

    /* https://github.com/benscabbia/x-ray */
    toggleXray: function() {
        const ghostCSS = `
            * {
                background: #000 !important;
                color: #0f0! important;
                outline: solid #f00 1px !important;
             }
        `;
        const xray = document.createElement('style');
        xray.innerHTML = ghostCSS;
        const xraysInPage = [...document.body.getElementsByTagName("style")]
              .filter(style => style.innerHTML === xray.innerHTML);
        if(xraysInPage.length > 0) {
            xraysInPage.forEach(style => document.body.removeChild(style));
        } else {
            document.body.appendChild(xray);
        }
    },
};
