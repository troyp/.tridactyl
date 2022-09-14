/*  ╭─────────╮
 *  │ cleanup │
 *  ╰─────────╯
 */
function cleanup() {
    const url = document.location.href;
    if (false) {
    } else if (url.match(/https:\/\/github\.com\/.*\/issues\//)) {
        keep("div#show_issue");
        rmall("img.avatar", "div.sidebar-notifications", ".gh-header-actions",
              "#issue-comment-box", ".discussion-timeline-actions");
    } else if (url.match(/https:\/\/janeblundellart\.blogspot\.com/)) {
        keep("#main");
        rmall("iframe", "script", "#blog-pager");
    } else if (url.match(/https:\/\/wiki.haskell\.org/)) {
        keep("#content");
        rmall("#catlinks");
    } else if (url.match(/https:\/\/www.codeproject\.com/)) {
        keep(".header", "#contentdiv");
        rmall("img.avatar");
    } else if (url.match(/https:\/\/onepiece-online-manga\.com/)) {
        keep("article");
        rmall(".simplesocialbuttons");
    } else if (url.match(/https:\/\/bartoszmilewski.com/))  {
        keep("#main");
        rmall(".comment-author.vcard>img");
    } else if (url.match(/https:\/\/patternsinfp.wordpress.com/))  {
        keep("#site-title,#content");
        rmall("#nav-above,#nav-below,#jp-post-flair,.reply,.post.pingback,#respond,#eu-cookie-law");
    } else if (url.match(/https:\/\/dzone.com/))  {
        rmall("iframe","script",".header",".announcementBar",".breadcrumb-padding",".signin-prompt",
              ".related","#adtoniq-msgr-bar");
    } else if (url.match(/https:\/\/www\.japanesewithanime\.com/)) {
        keep("article");
        $1("article").style.padding = "1em";
        rmall(".social-buttons-strip", "aside#sub-fold-ad", ".categoryNavbox", ".comment-footer",
              ".avatar-image-container", ".comment-reply", "#top-continue", ".article-end-footer");
    } else if (url.match(/https:\/\/opensource\.com/)) {
        keep("#article-template");
        rmall(".os-article__image", ".os-article__left", ".os-article__bottom",
              ".authorbio__thumbnail", ".user-picture-badges");
    } else if (url.match(/https:\/\/martinfowler\.com/)) {
        rmall("#banner", "#page-footer", ".author-photo");
    } else if (url.match(/https:\/\/blog\.sigplan\.org/)) {
        if (cleanupDisqus()) return;
        keep("article");
        rmall(".et_post_meta_wrapper>img");
        $1("body").style.margin = "3em";
    } else if (url.match(/https:\/\/www\.geeksforgeeks\.org/)) {
        if (cleanupDisqus()) return;
        keep(".leftSideBarParent", "#primary");
        rmall("iframe[allow*=autoplay]", ".entry-meta", ".upvoteArticle", ".nav-single");
        removeSelectorFiltered("div", e=>e.id.match(/^AP_G4GR/));
        getFirstSelector("#primary").style.width="70%";
    } else if (url.match(/https:\/\/www\.grammarly\.com/)) {
        rmall("._1X8pZ-overlay", "header", "._3fq8S-container", "._2Szu7-avatar", "._3uFk6-banner",
              ".tool__product", "._16iRt-container", "section.F0u0G-container", "._1hrQx-container", "footer");
    } else if (url.match(/https:\/\/collider\.com/)) {
        /* fix image height */
        keep("article:first-of-type");
        rmall("aside", ".heading_breadcrumb", ".heading_sharing", "span.next-single");
        $$("figure").forEach(f=>f.style.height=f.querySelector("img").height+"px");
    } else if (url.match(/https?:\/\/dnd5e\.wikidot\.com/)) {
        keep(".main-content-wrap");
        rm([".site-bar", ".mm-mega-menu"], "firstMatch");
    } else if (url.match(/https:\/\/www\.dndbeyond\.com/)) {
        // keep(".p-article-content");
        keep("header.page-header", "div.container", "ul.quick-menu");
        rmall("aside.tasha-notes");
        $$("aside").forEach(e => {
            e.style.border = "1px solid black";
            e.style.borderRadius = "15px";
            e.style.margin = "2em 10em";
            e.style.padding = "1em";
            e.style.backgroundColor = "rgba(252, 249, 246, 1)";
        });
    } else if (url.match("https://rpgbot.net")) {
        keep("article");
        $1("div>span[itemprop='name']").parentElement.remove();
        rmall(".topad", ".shareit");
    } else if (url.match("https://www.mapsofworld.com")) {
        keep("main");
        $1("main").style.paddingTop = "0";
        $1("section").style.marginTop = "0";
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
}

cleanup();
