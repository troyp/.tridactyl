/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if (typeof RuleLoader != "undefined" && typeof RuleControl != "undefined") {
    RuleControl.fnCloseRule();
} else {
    var RuleLoader = {};
    RuleLoader.bLoadingComplete = false;
    RuleLoader.fnLoadFile = function(c, d) {
        var a;
        if (d == "css") {
            a = document.createElement("link");
            a.type = "text/css";
            a.rel = "stylesheet";
            a.href = c;
            a.media = "screen";
            document.getElementsByTagName("head")[0].appendChild(a);
        } else {
            if (d == "image") {
                var b = new Image(1, 1);
                b.src = c;
            } else {
                a = document.createElement("script");
                a.setAttribute("language", "JavaScript");
                a.setAttribute("src", c);
                document.getElementsByTagName("body")[0].appendChild(a);
            }
        }
    };
    RuleLoader.fnLoad = function() {
        if (typeof Rule == "object" && typeof RuleControl == "object" && typeof jsCore == "object") {
            return 0;
        } else {
            var a = document.createElement("div");
            a.style.position = "absolute";
            a.style.top = "0";
            a.style.left = "0";
            a.style.color = "white";
            a.style.padding = "5px 10px";
            a.style.fontSize = "11px";
            a.style.fontFamily = '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
            a.style.zIndex = "32501";
            a.style.backgroundColor = "#a2392d";
            a.setAttribute("id", "LoadingRule");
            a.appendChild(document.createTextNode("Loading Rule..."));
            document.getElementsByTagName("body")[0].insertBefore(a, document.body.childNodes[0]);
            RuleLoader.fnLoadFile("http://localhost:8721/js/sprymedia/css/rule.css", "css");
            RuleLoader.fnLoadFile("http://localhost:8721/js/sprymedia/rule-complete.js", "js");
            return true;
        }
    };
    RuleLoader.fnLoad();
};
