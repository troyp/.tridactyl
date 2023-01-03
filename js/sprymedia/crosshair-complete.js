/*
 * Copyright 2007-2008 Allan Jardine. All rights reserved
 * Contact: allan.jardine /AT\ sprymedia.co.uk
 */

JSCore = function() {
    this.fnInit();
};
JSCore.prototype = {
    fnInit: function() {
        this.aStack = new Array();
        this.oInterval;
        this.bLoaded;
        this.aEventCache = new Array();
        this._fnLogInit();
    },
    addListener: function(d) {
        var a;
        var e;
        typeof d.sLabel != "undefined" ? null : d.sLabel = "";
        typeof d.oObj != "undefined" ? null : d.oObj = null;
        typeof d.mOverrideScope != "undefined" ? null : d.mOverrideScope = null;
        if (d.mScope) {
            if (d.mScope === true) {
                a = d.oObj;
            } else {
                a = d.mScope;
            }
        } else {
            a = d.mElement;
        }
        e = function(f) {
            if (!jsCore) {
                return 0;
            } else {
                d.fnCallback.call(a, jsCore._getEvent(f), d.oObj);
            }
            return false;
        };
        if (typeof(d.mElement) == "string") {
            var c = document.getElementById(d.mElement);
            jsCore._addEvent({
                nNode: c,
                sType: d.sType,
                fnCallback: d.fnCallback,
                fnCallbackWrapped: e,
                sLabel: d.sLabel
            });
        } else {
            if (d.mElement) {
                if (d.mElement.nodeName || d.mElement == window) {
                    jsCore._addEvent({
                        nNode: d.mElement,
                        sType: d.sType,
                        fnCallback: d.fnCallback,
                        fnCallbackWrapped: e,
                        sLabel: d.sLabel
                    });
                } else {
                    for (var b = 0; b < d.mElement.length; b++) {
                        jsCore._addEvent({
                            nNode: d.mElement[b],
                            sType: d.sType,
                            fnCallback: d.fnCallback,
                            fnCallbackWrapped: e,
                            sLabel: d.sLabel
                        });
                    }
                }
            }
        }
    },
    _addEvent: function(a) {
        this.aEventCache[this.aEventCache.length++] = {
            nNode: a.nNode,
            sType: a.sType,
            fnWrapped: a.fnCallbackWrapped,
            fn: a.fnCallback,
            sLabel: a.sLabel
        };
        if (a.nNode.addEventListener) {
            a.nNode.addEventListener(a.sType, a.fnCallbackWrapped, false);
        } else {
            if (a.nNode.attachEvent) {
                a.nNode.attachEvent("on" + a.sType, a.fnCallbackWrapped);
            }
        }
    },
    removeListener: function(b) {
        this.aiDelete = new Array();
        if (typeof b.sLabel == "string") {
            for (var a = 0; a < this.aEventCache.length; a++) {
                if (this.aEventCache[a].sLabel == b.sLabel) {
                    jsCore._removeEvent({
                        nNode: this.aEventCache[a].nNode,
                        sType: this.aEventCache[a].sType,
                        fn: this.aEventCache[a].fn
                    });
                }
            }
        } else {
            if (typeof b.mElement == "string") {
                nElement = document.getElementById(b.mElement);
                jsCore._removeEvent({
                    nNode: nElement,
                    sType: b.sType,
                    fn: b.fnCallback
                });
            } else {
                if (!b.mElement.length) {
                    jsCore._removeEvent({
                        nNode: b.mElement,
                        sType: b.sType,
                        fn: b.fnCallback
                    });
                } else {
                    for (var a = 0; a < b.mElement.length; a++) {
                        jsCore._removeEvent({
                            nNode: b.mElement[a],
                            sType: b.sType,
                            fn: b.fnCallback
                        });
                    }
                }
            }
        }
        for (var a = this.aiDelete.length - 1; a >= 0; a--) {
            this.aEventCache.splice(this.aiDelete[a], 1);
        }
    },
    _removeEvent: function(b) {
        for (var a = 0; a < this.aEventCache.length; a++) {
            if (b.nNode == this.aEventCache[a].nNode && b.sType == this.aEventCache[a].sType && b.fn == this.aEventCache[a].fn) {
                if (b.nNode.removeEventListener) {
                    b.nNode.removeEventListener(b.sType, this.aEventCache[a].fnWrapped, false);
                } else {
                    if (b.nNode.detachEvent) {
                        b.nNode.detachEvent("on" + b.sType, this.aEventCache[a].fnWrapped);
                    }
                }
                break;
            }
        }
        this.aiDelete[this.aiDelete.length++] = a;
    },
    _getEvent: function(a) {
        return a || window.event;
    },
    getElementFromEvent: function(a) {
        var b;
        if (a.target) {
            b = a.target;
        } else {
            if (a.srcElement) {
                b = a.srcElement;
            }
        }
        if (b.nodeType == 3) {
            b = b.parentNode;
        }
        return (b);
    },
    _log_aDatabase: new Array(),
    fnLog: function(b, a) {},
    _fnLogInit: function() {
        if (document.addEventListener) {
            document.addEventListener("keydown", this._fnLogShowHide, true);
        } else {
            if (document.attachEvent) {
                document.attachEvent("onkeydown", this._fnLogShowHide);
            }
        }
    },
    _fnLogShowHide: function(a) {
        a = a || window.event;
        var c = a.keyCode || a.which;
        var b = String.fromCharCode(c).toLowerCase();
        if (a.ctrlKey && a.shiftKey && b == "l") {
            alert("target key store detected " + a.shiftKey + " " + b + " " + c);
        }
    }
};
var jsCore = new JSCore();
jsCore.bAvailable = true;
if (typeof DesignCore != "undefined") {
    DesignCore = undefined;
}
var DesignCore = {
    fnCreateBox: function(a) {
        var b = document.createElement("div");
        b.setAttribute("style", "position: absolute; ");
        b.classList.add("spry-crosshair");
        if (typeof a.sPosition != "undefined") {
            if (a.sPosition == "fixed" && document.all && !window.opera && typeof document.body.style.maxHeight == "undefined") {
                b.style.position = "absolute";
            } else {
                b.style.position = a.sPosition;
            }
        } else {
            b.style.position = "absolute";
        }
        typeof a.sId != "undefined" ? b.setAttribute("id", a.sId) : null;
        typeof a.sClass != "undefined" ? b.className = a.sClass : null;
        typeof a.sBackgroundColour != "undefined" ? b.style.backgroundColor = a.sBackgroundColour : null;
        typeof a.sColour != "undefined" ? b.style.color = a.sColour : null;
        typeof a.sColour != "undefined" ? b.style.color = a.sColour : null;
        typeof a.sTop != "undefined" ? b.style.top = a.sTop : null;
        typeof a.sRight != "undefined" ? b.style.right = a.sRight : null;
        typeof a.sBottom != "undefined" ? b.style.bottom = a.sBottom : null;
        typeof a.sLeft != "undefined" ? b.style.left = a.sLeft : null;
        if (typeof a.sTop == "undefined" || typeof a.sBottom == "undefined") {
            typeof a.sHeight != "undefined" ? b.style.height = a.sHeight : null;
            if (a.sHeight == "1px") {
                b.style.overflow = "hidden";
            }
        }
        if (typeof a.sLeft == "undefined" || typeof a.sRight == "undefined") {
            typeof a.sWidth != "undefined" ? b.style.width = a.sWidth : null;
        }
        typeof a.sMarginTop != "undefined" ? b.style.marginTop = a.sMarginTop : null;
        typeof a.sMarginRight != "undefined" ? b.style.marginRight = a.sMarginRight : null;
        typeof a.sMarginBottom != "undefined" ? b.style.marginBottom = a.sMarginBottom : null;
        typeof a.sMarginLeft != "undefined" ? b.style.marginLeft = a.sMarginLeft : null;
        typeof a.sPadding != "undefined" ? b.style.padding = a.sPadding : null;
        typeof a.iZIndex != "undefined" ? b.style.zIndex = a.iZIndex : null;
        if (typeof a.fOpacity != "undefined") {
            typeof b.style.filter == "string" ? b.style.filter = "alpha(opacity=" + a.fOpacity * 100 + ")" : b.style.opacity = a.fOpacity;
        }
        return b;
    },
    fnGetPos: function(b) {
        var c = 0;
        var a = 0;
        if (b.offsetParent) {
            c = b.offsetLeft;
            a = b.offsetTop;
            while ((b = b.offsetParent)) {
                c += b.offsetLeft;
                a += b.offsetTop;
            }
        }
        return [c, a];
    },
    fnPageX: function(a) {
        iX = a.pageX ? a.pageX : a.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        return iX;
    },
    fnPageY: function(a) {
        iY = a.pageY ? a.pageY : a.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        return iY;
    },
    fnGetElementFromEvent: function(a) {
        var b;
        if (!a) {
            a = window.event;
        }
        if (a == null) {
            return null;
        }
        if (a.target) {
            b = a.target;
        } else {
            if (a.srcElement) {
                b = a.srcElement;
            }
        }
        if (b.nodeType == 3) {
            b = b.parentNode;
        }
        return (b);
    },
    fnGetElementsByClassName: function(g, e, d) {
        if (e == null) {
            e = "*";
        }
        if (d == null) {
            d = document;
        }
        var b = new Array();
        var h = new RegExp("\\b" + g + "\\b");
        var a = d.getElementsByTagName(e);
        for (var f = 0, c = a.length; f < c; f++) {
            if (h.test(a[f].className)) {
                b.push(a[f]);
            }
        }
        return (b);
    },
    fnSetSelectColourDisplay: function(a, b) {
        var d = b.getElementsByTagName("div");
        var c = this.fnGetElementsByClassName("colour_selected", "div", b);
        if (c[0]) {
            c[0].className = "colour " + (c[0].className.split(" ")[1]);
        }
        switch (a) {
            case "#000000":
            case "rgb(0, 0, 0)":
                d[0].className = "colour_selected c1";
                break;
            case "#BF0303":
            case "#bf0303":
            case "rgb(191, 3, 3)":
                d[1].className = "colour_selected c2";
                break;
            case "#BF0361":
            case "#bf0361":
            case "rgb(191, 3, 97)":
                d[2].className = "colour_selected c3";
                break;
            case "#85026C":
            case "#85026c":
            case "rgb(133, 2, 108)":
                d[3].className = "colour_selected c4";
                break;
            case "#34176E":
            case "#34176e":
            case "rgb(52, 23, 110)":
                d[4].className = "colour_selected c5";
                break;
            case "#00438A":
            case "#00438a":
            case "rgb(0, 67, 138)":
                d[5].className = "colour_selected c6";
                break;
            case "#006066":
            case "rgb(0, 96, 102)":
                d[6].className = "colour_selected c7";
                break;
            case "#00734D":
            case "#00734d":
            case "rgb(0, 115, 77)":
                d[7].className = "colour_selected c8";
                break;
            case "#00892C":
            case "#00892c":
            case "rgb(0, 137, 44)":
                d[8].className = "colour_selected c9";
                break;
            case "#F3C300":
            case "#f3c300":
            case "rgb(243, 195, 0)":
                d[9].className = "colour_selected c10";
                break;
            case "#888A85":
            case "#888a85":
            case "rgb(136, 138, 133)":
                d[10].className = "colour_selected c11";
                break;
            case "#FFFFFF":
            case "#ffffff":
            case "rgb(255, 255, 255)":
                d[11].className = "colour_selected c12";
                break;
            default:
                console.log("Unkown colour: " + a);
                break
        }
    },
    fnGetSliderValue: function(b) {
        var a = b.parentNode.offsetWidth - b.offsetWidth;
        return (b.style.left.split("px")[0] / a);
    },
    fnSetSliderValue: function(c, b) {
        var a = c.parentNode.offsetWidth - c.offsetWidth;
        c.style.left = (a * b) + "px";
    },
    fnCreateCookie: function(b, e) {
        var d = 365;
        var a = new Date();
        a.setTime(a.getTime() + (d * 24 * 60 * 60 * 1000));
        var c = "; expires=" + a.toGMTString();
        document.cookie = b + "=" + e + c + "; path=/";
    },
    fnReadCookie: function(e) {
        var a = e + "=";
        var d = document.cookie.split(";");
        for (var b = 0; b < d.length; b++) {
            var f = d[b];
            while (f.charAt(0) == " ") {
                f = f.substring(1, f.length);
            }
            if (f.indexOf(a) == 0) {
                return f.substring(a.length, f.length);
            }
        }
        return null;
    },
    fnGetStyle: function(a, b) {
        if (a.nodeName == "SCRIPT") {
            return "";
        }
        var c = "";
        if (document.defaultView && document.defaultView.getComputedStyle) {
            c = document.defaultView.getComputedStyle(a, "").getPropertyValue(b);
        } else {
            if (a.currentStyle) {
                b = b.replace(/\-(\w)/g, function(d, e) {
                    return e.toUpperCase();
                });
                c = a.currentStyle[b];
            }
        }
        return c;
    },
    toJsonString: function(a) {
        return this.toJsonStringArray(a).join("");
    },
    toJsonStringArray: function(a, c) {
        c = c || new Array();
        var b;
        switch (typeof a) {
            case "object":
                if (a) {
                    if (a.constructor == Array) {
                        c.push("[");
                        for (var d = 0; d < a.length; ++d) {
                            if (d > 0) {
                                c.push(",");
                            }
                            this.toJsonStringArray(a[d], c);
                        }
                        c.push("]");
                        return c;
                    } else {
                        if (typeof a.toString != "undefined") {
                            c.push("{");
                            var f = true;
                            for (d in a) {
                                var e = c.length;
                                if (!f) {
                                    c.push(",");
                                }
                                this.toJsonStringArray(d, c);
                                c.push(":");
                                this.toJsonStringArray(a[d], c);
                                if (c[c.length - 1] == b) {
                                    c.splice(e, c.length - e);
                                } else {
                                    f = false;
                                }
                            }
                            c.push("}");
                            return c;
                        }
                    }
                    return c;
                }
                c.push("null");
                return c;
            case "unknown":
            case "undefined":
            case "function":
                c.push(b);
                return c;
            case "string":
                c.push('"');
                c.push(a.replace(/(["\\])/g, "\\$1").replace(/\r/g, "").replace(/\n/g, "\\n"));
                c.push('"');
                return c;
            default:
                c.push(String(a));
                return c;
        }
    }
};
if (typeof Crosshair != "undefined") {
    Crosshair = undefined;
}
var Crosshair = {};
Crosshair.oBoxes = {
    oTop: {
        sBackgroundColour: "black",
        fOpacity: 1
    },
    oRight: {
        sBackgroundColour: "black",
        fOpacity: 1
    },
    oBottom: {
        sBackgroundColour: "black",
        fOpacity: 1
    },
    oLeft: {
        sBackgroundColour: "black",
        fOpacity: 1
    },
    iZIndex: 32203
};
Crosshair.iCursorSpacing = 15;
Crosshair.fnDisable = function() {
    document.body.removeChild(this.nTop);
    document.body.removeChild(this.nBottom);
    document.body.removeChild(this.nLeft);
    document.body.removeChild(this.nRight);
    document.body.removeChild(this.nInfo);
    jsCore.removeListener({
        sLabel: "CHEvent"
    });
};
Crosshair.fnClose = function() {
    this.fnDisable();
    if (typeof Design != "undefined") {
        document.getElementById("CrosshairSwitch").className = "level2";
        Design.oState.bCrosshair = false;
        Design.fnSaveState();
    }
    Crosshair = undefined;
};
Crosshair.fnEnable = function() {
    this.iBodyHeight = document.body.offsetHeight;
    this.iBodyWidth = document.body.offsetWidth;
    this.iViewportHeight = document.documentElement.clientHeight;
    this.iViewportWidth = document.documentElement.clientWidth;
    this.iContainerHeight = this.iViewportHeight > this.iBodyHeight ? this.iViewportHeight : this.iBodyHeight;
    this.nTop = DesignCore.fnCreateBox({
        sTop: 0,
        sLeft: 0,
        sHeight: "1px",
        sWidth: "1px",
        sBackgroundColour: this.oBoxes.oTop.sBackgroundColour,
        fOpacity: this.oBoxes.oTop.fOpacity,
        iZIndex: this.oBoxes.iZIndex
    });
    this.nBottom = this.nTop.cloneNode(false);
    this.nLeft = this.nTop.cloneNode(false);
    this.nRight = this.nTop.cloneNode(false);
    this.nInfo = DesignCore.fnCreateBox({
        sId: "CH_info",
        sTop: 0,
        sLeft: 0,
        sHeight: "10px",
        sWidth: "100px",
        sPadding: "5px",
        fOpacity: 0.8,
        iZIndex: 32300
    });
    this.nInfo.style.fontSize = "10px";
    this.nInfo.style.lineHeight = "10px";
    this.nInfo.style.fontFamily = '"Lucida Grande", Verdana, Arial, Helvetica, sans-serif';
    this.nInfo.style.textAlign = "center";
    this.nInfo.style.backgroundColor = "black";
    this.nInfo.style.color = "white";
    this.nInfo.style.visibility = "hidden";
    this.nInfo.style.MozBorderRadius = "3px";
    this.nInfo.style.WebkitBorderRadius = "3px";
    this.nInfo.style.borderRadius = "3px";
    this.nInfo.style.WebkitBoxShadow = "5px 5px 5px rgba(0, 0, 0, 0.5)";
    document.body.insertBefore(this.nTop, document.body.childNodes[0]);
    document.body.insertBefore(this.nBottom, document.body.childNodes[0]);
    document.body.insertBefore(this.nLeft, document.body.childNodes[0]);
    document.body.insertBefore(this.nRight, document.body.childNodes[0]);
    document.body.insertBefore(this.nInfo, document.body.childNodes[0]);
    jsCore.addListener({
        mElement: document,
        sType: "mousemove",
        fnCallback: this.fnMouseMove,
        oObj: this,
        mScope: true,
        sLabel: "CHEvent"
    });
};
Crosshair.fnMouseMove = function(a) {
    this.nTop.style.left = DesignCore.fnPageX(a) + "px";
    this.nTop.style.height = (DesignCore.fnPageY(a) - this.iCursorSpacing) > 0 ? (DesignCore.fnPageY(a) - this.iCursorSpacing) + "px" : "0px";
    this.nBottom.style.left = DesignCore.fnPageX(a) + "px";
    this.nBottom.style.top = (DesignCore.fnPageY(a) + this.iCursorSpacing) + "px";
    this.nBottom.style.height = (this.iContainerHeight - DesignCore.fnPageY(a) - this.iCursorSpacing) > 0 ? (this.iContainerHeight - DesignCore.fnPageY(a) - this.iCursorSpacing) + "px" : "0px";
    this.nLeft.style.top = DesignCore.fnPageY(a) + "px";
    this.nLeft.style.width = (DesignCore.fnPageX(a) - this.iCursorSpacing) > 0 ? (DesignCore.fnPageX(a) - this.iCursorSpacing) + "px" : "0px";
    this.nRight.style.top = DesignCore.fnPageY(a) + "px";
    this.nRight.style.left = (DesignCore.fnPageX(a) + this.iCursorSpacing) + "px";
    this.nRight.style.width = (this.iBodyWidth - DesignCore.fnPageX(a) - this.iCursorSpacing) > 0 ? (this.iBodyWidth - DesignCore.fnPageX(a) - this.iCursorSpacing) + "px" : "0px";
    this.nInfo.style.visibility = "visible";
    this.nInfo.style.top = document.documentElement.scrollTop + this.iViewportHeight < DesignCore.fnPageY(a) + 30 + 15 ? (DesignCore.fnPageY(a) - 20 - 15) + "px" : this.nInfo.style.top = (DesignCore.fnPageY(a) + 15) + "px";
    this.nInfo.style.left = document.documentElement.scrollLeft + this.iViewportWidth < DesignCore.fnPageX(a) + 100 + 25 ? this.nInfo.style.left = (DesignCore.fnPageX(a) - 110 - 15) + "px" : this.nInfo.style.left = (DesignCore.fnPageX(a) + 15) + "px";
    this.nInfo.innerHTML = "x: " + DesignCore.fnPageX(a) + " y: " + DesignCore.fnPageY(a);
};
Crosshair.fnEnable();
if (document.getElementById("LoadingCrosshair")) {
    document.getElementById("LoadingCrosshair").parentNode.removeChild(document.getElementById("LoadingCrosshair"));
};
