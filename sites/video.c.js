// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────╮
// │ MODULE: video │
// ╰───────────────╯

var vid = {};

vid.disneyp = {
    go: function() {
        const url = document.location.href;
        if (url.match(/\/video\//))
            cutils.click1("button.play-pause-icon") || cutils.get1("button", /play next episode/i);
        else if (url.match(/\/series\//))
            cutils.click1("button", /continue/i);
    },

};

window.vid = vid;
