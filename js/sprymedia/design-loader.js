/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */
if (typeof DesignLoader != "undefined" && typeof Design != "undefined") {
    Design.fnClose();
} else {
    var DesignLoader = {
        bLoadingComplete: false,
        fnLoadFile: function(c, d) {
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
                    document.body.appendChild(a);
                }
            }
        },
        fnPollReady: function(a, b) {
            if (typeof Design == "object" && typeof jsCore == "object") {
                Design.fnInit();
                this.fnComplete();
            } else {
                setTimeout(function() {
                    DesignLoader.fnPollReady();
                }, 100);
            }
        },
        fnComplete: function() {
            this.bLoadingComplete = true;
            document.body.removeChild(document.getElementById("DesignLoading"));
        },
        fnLoad: function() {
            if (this.bLoadingComplete == true) {
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
                a.setAttribute("id", "DesignLoading");
                a.appendChild(document.createTextNode("Loading Design..."));
                document.getElementsByTagName("body")[0].insertBefore(a, document.body.childNodes[0]);
                if (typeof Design == "object" && typeof jsCore == "object") {
                    DesignLoader.fnPollReady();
                } else {
                    setTimeout(function() {
                        DesignLoader.fnPollReady();
                    }, 1000);
                }
                DesignLoader.fnLoadFile("https://www.sprymedia.co.uk/design/design/media/css/design.css", "css");
                DesignLoader.fnLoadFile("https://www.sprymedia.co.uk/design/design/media/js/design-complete.js", "js");
                return true;
            }
        }
    };
    DesignLoader.fnLoad();
};
