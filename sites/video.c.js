// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────╮
// │ MODULE: video │
// ╰───────────────╯

var vid = {};

vid.disneyp = {
    go: function() {
        const url = document.location.href;
        if (url.match(/\/video\//))
            return cutils.click1('button[data-testid="up-next-play-button"]')
            || cutils.click1("button.play-pause-icon")
            || cutils.get1("button", /play next episode/i);
        else if (url.match(/\/series\//))
            return cutils.click1("button", /continue/i);
    },

    playpause: function() {
        const url = document.location.href;
        if (url.match(/\/video\//))
            cutils.click1("button.play-pause-icon") || cutils.get1("button", /play next episode/i);
        else if (url.match(/\/series\//))
            cutils.click1("button", /continue/i);
    },

};

vid.netflix = {
    go: function() {
        return cutils.click("button.watch-video--skip-content-button") || this.togglePlay();
    },

    pause: function() { $1("video").pause(); return false; },
    play: function() { $1("video").play(); return true; },

    togglePlay: function() {
        const video = $1("video");
        if (video.paused) return this.play();
        else return this.pause();
    },
};

window.vid = vid;
