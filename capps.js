// ╭────────────────────────────────────────────────────────────╮
// │ capps.js -- Content Script Application code for .tridactyl │
// ╰────────────────────────────────────────────────────────────╯

var capps = {

    sunriseSunset: function(lat, long) {
        const times = SunCalc.getTimes(new Date(), lat, long);
        return [times.sunrise, times.sunset].map(t=>t.toTimeString());
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
