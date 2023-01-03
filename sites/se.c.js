var se = {
    cleanup: function(showSnippetResults) {
        if (showSnippetResults) {
            cutils.get(".snippet-ctas button", e=>!e.classList.contains("hideResults")).forEach(e=>e.click());
            rm('.snippet-ctas');
        } else {
            rm('.snippet-result');
        }
        rmall(
            'script', 'iframe',
            'header','#sidebar', '.aside-cta', '#left-sidebar',    // header, sidebar, ask a question
            '.js-dismissable-hero',                                // join this community banner
            '.post-taglist', '.special-status',
            '.bounty-notification',
            '.star-off', '.favoritecount', '#tabs',
            '#PrinterFriendly',                                    // added-by-userscript
            '.grid.s-btn-group',
            '.vt',                                                 //  share-edit-flag
            '.vote-up-off', '.vote-down-off', '.js-add-link',
            '#onetrust-consent-sdk', '#onetrust-banner-sdk',
            '#ot-pc-content', '#onetrust-style',
            '.adsbox',
            '.js-consent-banner',                                  // cookie consent dialog
            '.user-gravatar32', '.-flair',
            '.bottom-notice', 'form', '#footer', '#feed-link',
            '.s-modal',
            '#answers-header>div.answers-subheader>div.flex--item:last-of-type'
        );
        $$cls("bounty").forEach(e=>e.parentElement.parentElement.remove());
        $$cls("post-menu").forEach(e=>e.parentElement.remove());
        rm(".js-post-menu div.flex--item", "Improve this answer|Edit|Flag");
        document.body.style.paddingTop='0';
    },

    /* isolate a post (or other element) and remove clutter */
    printPost: function(post) {
        [...document.body.children].forEach(elt => elt.remove());
        document.body.appendChild(post);
        rmall(
            ".post-layout--right>div:nth-of-type(2)",
            ".suggest-edit-post",
            ".short-link",
            ".user-gravatar32",
            ".vote-up-on", ".vote-up-off", ".vote-down-on", ".vote-down-off"
        );
    },

    getChatUrl: function(url=tri.contentLocation) {
        var [_, _, subdomain, site] =
            url.host.match(/(([^.]+)\.)?(stackoverflow\.com|superuser\.com|[^.]+\.stackexchange\.com)/);
        if (site == "stackoverflow.com") {
            return "https://chat.stackoverflow.com/?tab=site&host=stackoverflow.com";
        } else {
            return "https://chat.stackexchange.com/?tab=site&host=" + site;
        }
    },

    widen: function() {
        const cssrules = [
            ["#sidebar", "display: none;"],
            ["#left-sidebar", "display: none;"],
            ["#mainbar", "width: 1200px;"],
        ];
        cutils.css.toggleOrCreate("_tri_widen", ...cssrules);
    },
}

window.se = se;
