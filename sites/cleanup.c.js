/*  ╭─────────╮

 *  │ cleanup │
 *  ╰─────────╯
 */
function cleanup() {
    const url = document.location.href;
    if (false) {
    } else if (url.match(/https:\/\/www\.amikosimonetti\.com\//)) {
        /* amikosimonetti.com */
        rmall(
            "header", "footer", "iframe",
            "nav.BlogItem-pagination", "section[id*=comments]", "div.BlogItem-share",
        );
    } else if (url.match(/https:\/\/bartoszmilewski.com/))  {
        /* bartoszmilewski.com */
        keep("#main");
        rmall(".comment-author.vcard>img");
    } else if (url.match(/https:\/\/www.codeproject\.com/)) {
        /* codeproject.com */
        keep(".header", "#contentdiv");
        rmall("img.avatar");
    } else if (url.match(/https:\/\/collider\.com/)) {
        /* collider.com */
        /* fix image height */
        keep("article:first-of-type");
        rmall("aside", ".heading_breadcrumb", ".heading_sharing", "span.next-single");
        $$("figure").forEach(f=>f.style.height=f.querySelector("img").height+"px");
    } else if (url.match(/https:\/\/www\.dndbeyond\.com/)) {
        /* dndbeyond.com */
        // keep(".p-article-content");
        keep("header.page-header", "div.container", "ul.quick-menu");
        rmall("aside.tasha-notes", ".homebrew-comments", ".page-header__extra--content2");
        $$("aside").forEach(e => {
            e.style.border = "1px solid black";
            e.style.borderRadius = "15px";
            e.style.margin = "2em 10em";
            e.style.padding = "1em";
            e.style.backgroundColor = "rgba(252, 249, 246, 1)";
        });
    } else if (url.match(/https?:\/\/dnd5e\.wikidot\.com/)) {
        /* dnd5e.wikidot.com */
        keep(".main-content-wrap");
        rm([".site-bar", ".mm-mega-menu"], "firstMatch");
    } else if (url.match(/https:\/\/dzone.com/))  {
        /* dzone */
        rmall("iframe","script",".header",".announcementBar",".breadcrumb-padding",".signin-prompt",
              ".related","#adtoniq-msgr-bar");
    } else if (url.match(/https:\/\/[^/]+\.fandom\.com\//) || url.match(/https:\/\/[^/]+\.wikia\.com\//)) {
        /* fandom.com */
        /* FIXME */
        rmall(
            '#WikiaTopAds', '.wikia-ad', '#WikiaArticleBottomAd',
            'WikiaAdInContentPlaceHolder', '#recirculation-rail', '.recirculation-rail',
            '.celtra-screen-object-container', '.celtra-view', '.videoAdUi',
            '#WikiHeader', '.header-tally', '.wikia-button', '.wikia-menu-button', '.editsection', '.WikiaRail',
            '.navbox', '.WikiaArticleInterlang', '.refpopups-configure-page', '#WikiaArticleFooter', 'footer',
            '#WikiaFooter', '.wds-global-footer', '#WikiaBar', 'script','#WikiaNotifications', 'iframe', '#ad-skin',
            '.featured-video__wrapper'
        );
        cutils.hide('.wds-global-navigation-wrapper');
        const divs = Array.from(content.document.getElementsByTagName('div'));
        const videodivs = divs.filter(e=>e.getAttribute("itemtype")=="http://schema.org/VideoObject");
        videodivs.forEach(e=>e.parentNode.removeChild(e));
    } else if (url.match(/https:\/\/www\.geeksforgeeks\.org/)) {
        /* geeksforgeeks */
        if (cleanupDisqus()) return;
        keep(".leftSideBarParent", "#primary");
        rmall("iframe[allow*=autoplay]", ".entry-meta", ".upvoteArticle", ".nav-single");
        removeSelectorFiltered("div", e=>e.id.match(/^AP_G4GR/));
        getFirstSelector("#primary").style.width="70%";
    } else if (url.match(/https:\/\/forums\.giantitp\.com/)) {
        /* gianttip.com */
        keep("#content");
        rmall("h2>img", "#above_postlist", "#thread_controls", "#below_postlist", ".navlinks", "#thread_info", ".userinfo img");
        $1("html").style.background = "white";
        const hd2 = $1("h2");
        hd2.style.fontSize = "150%";
        hd2.style.fontStyle = "italic";
        hd2.style.fontWeight = "normal";
        const hd1 = $1("h1");
        hd1.style.background = "white";
        hd1.style.fontSize = "200%";
        hd1.style.padding = "5px";
        hd1.style.border = "black solid 1px";
        hd1.style.borderRadius = "1px";
    } else if (url.match(/https:\/\/github\.com\/.*\/issues\//)) {
        /* github */
        keep("div#show_issue");
        rmall("img.avatar", "div.sidebar-notifications", ".gh-header-actions",
              "#issue-comment-box", ".discussion-timeline-actions");
    } else if (url.match(/https:\/\/www\.grammarly\.com/)) {
        /* grammarly */
        rmall("._1X8pZ-overlay", "header", "._3fq8S-container", "._2Szu7-avatar", "._3uFk6-banner",
              ".tool__product", "._16iRt-container", "section.F0u0G-container", "._1hrQx-container", "footer");
    } else if (url.match(/https:\/\/wiki.haskell\.org/)) {
        /* haskell wiki */
        keep("#content");
        rmall("#catlinks");
    } else if (url.match(/https:\/\/www.instructables\.com/)) {
        /* instructables */
        keep("article#article");
        rmall("section.recommendations", "section#imadeits", "div.contest-entries");
    } else if (url.match(/https:\/\/imsdb\.com\/scripts\//)) {
        /* imsdb */
        const table = $1(".scrtext").closest("table");
        keep(table);
        table.style.margin = "4em";
    } else if (url.match(/https:\/\/janeblundellart\.blogspot\.com/)) {
        /* janeblundellart */
        keep("#main");
        rmall("iframe", "script", "#blog-pager");
    } else if (url.match(/https:\/\/www\.japanesewithanime\.com/)) {
        /* japanesewithanime */
        keep("article");
        $1("article").style.padding = "1em";
        rmall(".social-buttons-strip", "aside#sub-fold-ad", ".categoryNavbox", ".comment-footer",
              ".avatar-image-container", ".comment-reply", "#top-continue", ".article-end-footer");
    } else if (url.match("https://www.mapsofworld.com")) {
        /* mapsofworld.com */
        keep("main");
        $1("main").style.paddingTop = "0";
        $1("section").style.marginTop = "0";
    } else if (url.match(/https:\/\/martinfowler\.com/)) {
        /* martinfowler.com */
        rmall("#banner", "#page-footer", ".author-photo");
    } else if (url.match(/https:\/\/onepiece-online-manga\.com/)) {
        /* onepiece-online-manga.com */
        keep("article");
        rmall(".simplesocialbuttons");
    } else if (url.match(/https:\/\/opensource\.com/)) {
        /* opensource.com */
        keep("#article-template");
        rmall(".os-article__image", ".os-article__left", ".os-article__bottom",
              ".authorbio__thumbnail", ".user-picture-badges");
    } else if (url.match(/https:\/\/www\.netflix\.com\//)) {
        /* netflix.com */
        rmall(".static-image.image-layer", ".billboard-row", ".spotlight");
    } else if (url.match(/https:\/\/patternsinfp.wordpress.com/))  {
        /* patternsinfp.wordpress.com */
        keep("#site-title,#content");
        rmall("#nav-above,#nav-below,#jp-post-flair,.reply,.post.pingback,#respond,#eu-cookie-law");
    } else if (url.match(/https:\/\/poets\.org\/poem\//)) {
        /* poets.org */
        keep(".card-header", ".card-body");
        rmall(".poem__actions");
    } else if (url.match("https://rpgbot.net")) {
        /* rpgbot.net */
        keep("article");
        $1("div>span[itemprop='name']").parentElement.remove();
        rmall(".topad", ".shareit", "span[id^=ezoic]");
    } else if (url.match(/https:\/\/blog\.sigplan\.org/)) {
        /* sigplan.org */
        if (cleanupDisqus()) return;
        keep("article");
        rmall(".et_post_meta_wrapper>img");
        $1("body").style.margin = "3em";
    } else if (url.match(/https:\/\/tabletopbuilds\.com\//)) {
        /* tabletopbuilds.com */
        rmall(
            "#respond", "#search-3", "#recent-posts-2", ".custom-logo-link",
            ".post-navigation", ".ssba-classic-2", "footer",
        );
        /* left panel */
        const darkSwitch = $1(".wpnm-button");
        const leftPanel = $1(".resp-sidebar-wrapper");
        const newSection = document.createElement("section");
        newSection.appendChild(darkSwitch);
        leftPanel.insertBefore(newSection, leftPanel.firstChild);
        rm("#custom_html-5");
        darkSwitch.style.backgroundColor = "white";
        darkSwitch.style.padding = "1em";
        darkSwitch.style.borderRadius = "8px";
        darkSwitch.style.borderWidth = "5px";
        darkSwitch.style.borderImage = "radial-gradient(#dbdbe0, transparent) 1";
        darkSwitch.style.margin = "0 0 2em";
    } else {
        cleanupGeneric();
    }
}

function cleanupGeneric() {
    rmall(
        "header", "#header", ".header",
        "footer", "#footer", ".footer",
        "aside", "#aside", ".aside",
        "form", "#topbar", ".topbar",
        "#sidebar", ".sidebar",
        "#comments", "#feed-link", "#respond"
    );
    cutils.message("Default method used", true);
}

cleanup();
