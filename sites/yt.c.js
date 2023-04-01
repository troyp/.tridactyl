// ───────────────────────────────────────────────────────────────────────────────
// ╭────────────────────────────╮
// │ yt.c.js -- Youtube methods │
// ╰────────────────────────────╯

var yt = {
    minSpeed: 0.25,

    player: () => $id("movie_player").wrappedJSObject,
    video: () => $1("video"),
    controls: () => $1('.ytp-chrome-bottom'),

    /* speed */
    getSpeed: function() { return this.player().getPlaybackRate(); },
    setSpeed: function(r) {
        r ??= 1;
        r = Math.max(r, this.minSpeed);
        return this.player().setPlaybackRate(r) && r;
    },
    adjustSpeed: function(delta) {
        const r = this.getSpeed() + delta;
        this.setSpeed(r);
        cutils.message(`speed: ${r}`, true);
        return r;
    },

    play: function() { this.player().playVideo(); },
    pause: function() { this.player().pauseVideo(); },
    isPaused: function() { return this.player().getPlayerState() == 2; },
    togglePause: function() { if (this.isPaused()) this.play(); else this.pause(); },
    toggleMute: function() {
        const player = this.player();
        if (player.isMuted()) player.unMute(); else player.mute();
    },

    getTime: function() { return this.player().getCurrentTime(); },
    setMark: function(c) {
        const t = this.getTime();
        window[`_tri_yt_reg_${c}`] = t;
        fillcmdline_nofocus(`MARK register ${c}: ${t}`);
    },
    gotoMark: function(c) { this.player().seekTo(window[`_tri_yt_reg_${c}`]); },

    forward: function(n) {
        this.player().seekBy(n);
        return cutils.message(formatSeconds(this.getTime()), true);
    },

    volumeAdjust: function(dvol=1) {
        const step = 5;
        const cutoff = (num, min, max) => Math.min(Math.max(num, min), max);
        const player = this.player();
        const vol = cutoff(player.getVolume() + step*dvol, 0, 100);
        this.showVolumeSlider();
        player.setVolume(vol);
        cutils.message(`volume: ${vol}`, true);
        return vol;
    },
    volumeDown: function(dvol=1) { return this.volumeAdjust(-dvol); },

    showVolumeSlider: function() { this.controls().classList.add('ytp-volume-slider-active'); },

    playlistItems: function(opts={}) {
        opts = cutils.tri.parseOpts({castBoolean:"index"});
        const items = $$("#playlist-items #container");
        return items.map(item => {
            const index = item.querySelector("#index")?.innerText;
            const title = item.querySelector("h4")?.innerText;
            return opts.index ? `${index}:\t${title}` : title;
        });
    },

    ytdl: function(dir="~/Downloads", video=true) {
        dir = cutils.tri.parseArgs(dir, "string");
        const extraArgs = video ? "--all-subs" : "-f bestaudio";
        const cmd =
              "! cd ${dir};"
              + `youtube-dl -ci ${extraArgs} --xattrs -o "%(title)s-%(id)s.%(ext)s" "${buffer.URL}"`;
        dactyl.execute(cmd);
    },

    closeAd: function() {
        const imgs = Array.from(document.getElementsByTagName("img"));
        imgs.forEach(img=>{
            if (img.src.includes('googlesyndication'))
                imgs.forEach(e=>e.remove && e.remove());
        });
    },

    screenshot: function(opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castBoolean: "save",
            castString: "type",
            defaults: { type: "jpeg", },
        });
        var title = opts.title || $1("#container>h1.title").textContent;
        const video = document.querySelector("video");
        const canvas = document.createElement("canvas");
        canvas.width = video.clientWidth;
        canvas.height = video.clientHeight;
        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const data = canvas.toDataURL(`image/${opts.type}`);
        if (opts.save)
            return cutils.saveURL(data, title);
        else
            return window.open(data);
    },

    up: function(count) {
        if (tri.contentLocation.href.match("https://www.youtube.com/watch?v="))
            return cutils.click("a", /Show \d+ more/);
        else
            return this.adjustSpeed(0.25 * (count || 1));
    },
    down: function(count) {
        if (tri.contentLocation.href.match("https://www.youtube.com/watch?v="))
            return cutils.click("a", /Show fewer/);
        else
            return this.adjustSpeed(-0.25 * (count || 1));
    },

    openTranscript: function() {
        $1("button#button[aria-label*='More actions']").click();
        window.setTimeout(
            ()=> $1t("tp-yt-paper-item", "transcript").click(),
            500
        );
    },
    closeTranscript: function() {
        const btn = $1("button[aria-label='Close transcript']");
        if (btn) {
            btn.click();
            return true;
        } else return false;
    },
    toggleTranscript: function() {
        const transcript = $1t("ytd-engagement-panel-section-list-renderer", /^Transcript/);
        if (transcript && cutils.isDisplayed(transcript))
            this.closeTranscript();
        else
            this.openTranscript();
    },
    copyTranscript: function(opts={}) {
        opts = cutils.tri.parseOpts(opts, {
            castBoolean: "timestamps",
            castNode: "transcript",
            defaults: {
                transcript: $1t("#header","Transcript"),
            },
        });
        if (opts.timestamps) {
            cutils.yank(
                opts.transcript.nextElementSibling.textContent
                    .replace(/^      ([^ \n]+)$\n */mg, "$1\t")
                    .replace(/^ +/mg, "")
                    .replace(/\n+/g, "\n")
            );
        } else {
            yankby(".ytd-transcript-segment-renderer.segment-text");
        }
    },
    openAndCopyTranscript: function(opts={}) {
        this.openTranscript();
        window.setTimeout(
            ()=> this.copyTranscript(opts),
            500
        );
    },

    /* Choose item from menu */
    chooseItem: async function() {
        const items = $$("#endpoint");
        capps.rofi(items.map(e=>e.getAttribute("title"))).then(i=>open(items[i].href));
    },

    dl: function(url=tri.contentLocation, opts={}) {
        const dir = opts.dlDir || "~/Downloads";
        const xtraArgs = video ? "--all-subs" : "-f bestaudio";
        const cmd = `!cd ${dir}; youtube-dl -ci ${xtraArgs} --xattrs -o "%(title)s-%(id)s.%(ext)s" "${buffer.URL}"`;
    },
};

window.yt = yt;
