// ╭────────────────────────────────────────────────────────────╮
// │ capps.js -- Content Script Application code for .tridactyl │
// ╰────────────────────────────────────────────────────────────╯

var capps = {

    sunriseSunset: function(lat, long) {
        const times = SunCalc.getTimes(new Date(), lat, long);
        return [times.sunrise, times.sunset].map(t=>t.toTimeString());
    },

    toggleCrosshair: function() {
        if ($1(".spry-crosshair"))
            rmall(".spry-crosshair");
        else
            tri.excmds.js("-r", "js/sprymedia/crosshair-loader.js");
        document.dispatchEvent(new Event("input"));
        document.dispatchEvent(new Event("change"));
    },

    /* http://slayeroffice.com/tools/modi/v2.0/modi_help.html */
    modi: function() {
        window.prefFile = "";
        const script = document.createElement("script");
        document.body.appendChild(script);
        script.language = "javascript";
        script.type = "text/javascript";
        script.src = "http://slayeroffice.com/tools/modi/v2.0/modi_v2.0.js";
        script.id = "modi";
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

window.capps = capps;
