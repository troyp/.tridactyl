
var fullTOCText = "Table of Contents";
var matchStr = /^h[1-6]$/i;
var resetSelect = false;
/* var addMenuItem = false; */

function f() {
    if (document.getElementsByTagName("html").length &&
        (document.getElementsByTagName("h1").length ||
         document.getElementsByTagName("h2").length ||
         document.getElementsByTagName("h3").length ||
         document.getElementsByTagName("h4").length ||
         document.getElementsByTagName("h5").length ||
         document.getElementsByTagName("h6").length)) {
        var aHs = getHTMLHeadings();
        if (aHs.length > 2) {
            addCSS("#js-toc {position: fixed; left: 0; right: 0; top: auto; bottom: 0; height: 20px; width: 100%; vertical-align: middle; display: block; border-top: 1px solid #777; background: #ddd; margin: 0; padding: 3px; z-index: 9999; }\n" + "#js-toc select { font: 8pt verdana, sans-serif; margin: 0; margin-left:5px; background-color: #fff; color: #000; float: left; padding: 0; vertical-align: middle;}\n" + "#js-toc option { font: 8pt verdana, sans-serif; color: #000; }");
            var toc = document.createElement(window.opera ? "tocuserjselem" : "div");
            toc.id = "js-toc";
            var tocSelect = document.createElement("select");
            tocSelect.setAttribute(
                "onchange",
                resetSelect
                    ? "if(this.value){location.href='#'+this.value;this.selectedIndex=0;}"
                    : "location.href='#'+this.value;"
            );
            tocSelect.id = "navbar-toc-select";
            var tocEmptyOption = document.createElement("option");
            tocEmptyOption.setAttribute("value", "");
            tocEmptyOption.appendChild(document.createTextNode(fullTOCText));
            tocSelect.appendChild(tocEmptyOption);
            toc.appendChild(tocSelect);
            document.body.style.paddingBottom = "27px";
            document.body.appendChild(toc);
            for (var i = 0, aH; (aH=aHs[i]); i++) {
                if (aH.offsetWidth) {
                    let op = document.createElement("option");
                    op.appendChild(document.createTextNode(gs(aH.tagName) + getInnerText(aH).substring(0, 100)));
                    let refID = aH.id ? aH.id : aH.tagName + "-" + (i * 1 + 1);
                    op.setAttribute("value", refID);
                    document.getElementById("navbar-toc-select").appendChild(op);
                    aH.id = refID;
                }
            }
        }
    }
}

/*
function autoTOC_toggleDisplay() {
    if (document.getElementById("js-toc")) {
        if (document.getElementById("js-toc").style.display == "none") {
            document.getElementById("js-toc").style.display = "block";
        } else {
            document.getElementById("js-toc").style.display = "none";
        }
    } else {
        f();
    }
}
*/

function getHTMLHeadings() {
    function acceptNode(node) {
        if (node.tagName.match(matchStr)) {
            return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
    }
    let outArray = new Array();
    if (document.createTreeWalker) {
        var treeWalker = document.createTreeWalker(
            document.documentElement,
            NodeFilter.SHOW_ELEMENT,
            acceptNode,
            true
        );
        if (treeWalker) {
            var node = treeWalker.nextNode();
            while (node) {
                outArray.push(node);
                node = treeWalker.nextNode();
            }
        }
    } else {
        var els = document.getElementsByTagName("*");
        var j = 0;
        for (var i = 0, el; (el=els[i]); i++) {
            if (el.tagName.match(matchStr)) outArray[j++] = el;
        }
    }
    return outArray;
}

function addCSS(css) {
    var head, styleLink;
    head = document.getElementsByTagName("head")[0];
    if (!head) {
        return;
    }
    styleLink = document.createElement("link");
    styleLink.setAttribute("rel", "stylesheet");
    styleLink.setAttribute("type", "text/css");
    styleLink.setAttribute("href", "data:text/css," + escape(css));
    head.appendChild(styleLink);
}

function gs(s) {
    s = s.toLowerCase();
    var ret = "";
    for (var i = 1; i < (s.substring(1) * 1); i++) {
        ret = ret + "\u00a0 \u00a0 ";
    }
    return ret;
}

function getInnerText(el) {
    var s = "";
    for (var i = 0, node; (node=el.childNodes[i]); i++) {
        if (node.nodeType == 1) s += getInnerText(node);
        else if (node.nodeType == 3) s += node.nodeValue;
    }
    return s;
}
f();
