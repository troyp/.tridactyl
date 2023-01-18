/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if (typeof CrosshairLoader != "undefined" && typeof Crosshair != "undefined") {
    Crosshair.fnClose();
} else {
    var CrosshairLoader = {};
    CrosshairLoader.bLoadingComplete = false;
    CrosshairLoader.fnLoadFile = function(source, tagname) {
        var resourceElt;
        if (tagname == "css") {
            resourceElt = document.createElement("link");
            resourceElt.classList.add("spry-crosshair");
            resourceElt.type = "text/css";
            resourceElt.rel = "stylesheet";
            resourceElt.href = source;
            resourceElt.media = "screen";
            document.getElementsByTagName("head")[0].appendChild(resourceElt);
        } else if (tagname == "image") {
            var b = new Image(1, 1);
            b.src = source;
        } else {
            resourceElt = document.createElement("script");
            resourceElt.classList.add("spry-crosshair");
            resourceElt.setAttribute("language", "JavaScript");
            resourceElt.setAttribute("src", source);
            document.getElementsByTagName("body")[0].appendChild(resourceElt);
        }
    };
    CrosshairLoader.fnLoad = function() {
        if (typeof Crosshair == "object" && typeof jsCore == "object") {
            return 0;
        } else {
            const div = document.createElement("div");
            div.classList.add("spry-crosshair");
            div.style.position = "absolute";
            div.style.top = "0";
            div.style.left = "0";
            div.style.color = "white";
            div.style.padding = "5px 10px";
            div.style.fontSize = "11px";
            div.style.fontFamily = '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
            div.style.zIndex = "32501";
            div.style.backgroundColor = "#a2392d";
            div.setAttribute("id", "LoadingCrosshair");
            div.appendChild(document.createTextNode("Loading Crosshair..."));
            document.getElementsByTagName("body")[0].insertBefore(div, document.body.childNodes[0]);
            CrosshairLoader.fnLoadFile("http://localhost:8721/js/sprymedia/crosshair-complete.js", "js");
            return true;
        }
    };
    CrosshairLoader.fnLoad();
}
