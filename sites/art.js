// ╭────────────╮
// │ MODULE art │
// ╰────────────╯

sites.LISTS.art_sites = [
    "jacksonsart.com",
];

// ───────────────────────────────────────────────────────────────────────────────
// ╭───────────────╮
// │ Handprint.com │
// ╰───────────────╯
const handprint = {
    getURL: function(...args) {
        const wcUrl = "https://www.handprint.com/HP/WCL/";
        var colSuffix = "";
        var url, pigment="";
        var match;
        var m, n;
        if ( args.length==0 || args[0].match(/index/ ) ) url = wcUrl;
        else if ( args[0].match(/guide/ ) )                                url = wcUrl + "waterfs.html";
        else if ( args[0].match(/colou?r/ ) )                              url = wcUrl + "wcolor.html";
        else if ( args[0].match(/vision/ ) )                               url = wcUrl + "color.html";
        else if ( args[0].match(/paint/ ) )                                url = wcUrl + "wpaint.html";
        else if ( args[0].match(/tech(nique)?/) )                          url = wcUrl + "wtech.html";
        else if ( args[0].match(/(wheel|a\*b)/) )                          url = wcUrl + "labwheel.html";
        else if ( args[0].match(/((color)?map|scheme)/) )                  url = wcUrl + "colormap.html";
        else if ( args[0].match(/(test|lightfast)/))                       url = wcUrl + "litetest.html";
        else if ( args[0].match(/pal(et(tes?)?)?$/) )                      url = wcUrl + "wpalet.html";
        else if ( (match=args[0].match(/pal(ette)?(\d+\w?)/)) )            url = wcUrl + `palette${match[2]}.html`;
        else if ( args[0].match(/brush(es)?/) )                            url = wcUrl + "wbrush.html";
        else if ( args[0].match(/paper/) )                                 url = wcUrl + "wpaper.html";
        else if ( args[0].match(/books?/) )                                url = wcUrl + "wbooks.html";
        else if ( args[0].match(/ma[kd]e|manu(facture)?|pig(ments?)?/) )   url = wcUrl + "pigmt1.html";
        else if ( args[0].match(/attrib(utes?)?/) )                        url = wcUrl + "pigmt3.html";
        else if ( args[0].match(/ratings?/) )                              url = wcUrl + "pigmt8.html";
        else if ( args[0].match(/prima(tek)?/) )                           url = wcUrl + "primatek.html";
        else if ( args[0].match(/choose/) )                                url = wcUrl + "pigmt0.html";
        else if ( args[0].match(/nat.*ino/) )                              url = wcUrl + "pigmt1a.html";
        else if ( args[0].match(/syn.*ino/) )                              url = wcUrl + "pigmt1b.html";
        else if ( args[0].match(/nat.*org/) )                              url = wcUrl + "pigmt1c.html";
        else if ( args[0].match(/syn.*org/) )                              url = wcUrl + "pigmt1d.html";
        else if ( args[0].match(/^e$/) )                                   url = wcUrl + "watere.html";
        else if ( (match = args[0].trim().match(/^\/?(P|N)?(Y|O|R|G|B[rk]?|V|W)(:.+$|[0-9]*)/i)) ) {
            /* precede pigment with slash to find pigment page but exclude fragment from URL                 */
            /* a pigment name can be used instead of a number, by placing a colon after the page colour code */
            /*     eg. br:quinacridone orange                                                                */
            var nopig = (match[0][0] == "/");
            /* default pigment prefix is "P" */
            var pref = (match[1] || "P").toUpperCase();
            var col = match[2] && (match[2][0].toUpperCase()+match[2].slice(1).toLowerCase());
            if (match[3].startsWith(":")) {
                pigment = [match[3].slice(1), args.slice(1)].join(" ");
            } else {
                const num = match[3];
                pigment = (nopig || num=="") ? "" : (pref + col + num);
            }
            if ((col == "Bk") || (col =="W"))
                colSuffix = "w";
            else if (col == "Br" || ["PO48","PO49","PO65","PR101","PR102","PR175","PR206","PR233","PY42","PY43","PY119"].includes(pigment))
                colSuffix = "e";
            else if (["PR60","PR122","PR171","PR202","NR4","NR9","PV19","PV32","PV42"].includes(pigment))
                colSuffix = "c";
            else if (["PR88"].includes(pigment))
                colSuffix = "v";
            else if (col)
                colSuffix = col.toLowerCase();
            url = wcUrl + "water" + colSuffix + ".html";
            /* alert("pref: "+pref+"\ncol: "+col+"\nmatch[3]: "+(match&&match[3])+"\npigment: "+pigment+"\ncolSuffix: "+colSuffix); */
        } else url = wcUrl;

        return [url, pigment];
    },

    openOrSelect: async function(where, ...args) {
        var [page, pigment] = this.getURL(...args);
        where ||= "related";
        var re;
        if (pigment && pigment.match(/^\/?(P|N)?(Y|O|R|G|B[rk]?|V|W)[0-9]*/i)) {
            re = RegExp("^" + pigment + "(:\\\\d+)?(\\\\(\\\\d+\\\\))?$");
        } else if (pigment) {
            re = RegExp("^" + pigment);
        } else {
            re = /^/;
        }
        return utils.tab.openAndRun(
            page,
            `[...document.getElementsByTagName("td")].find(e=>e.textContent.match(${re})).scrollIntoView()`,
            {
                regex: RegExp(page+"($|#)"),
                where: where,
            }
        );
    },

    tableKey: [
        "Tr St VR Gr Bl Df HA HS Lf",
        "01 Tr = Transparency: 0 (very opaque) to 4 (transparent)",
        "02 St = Staining: 0 (nonstaining) to 4 (heavily staining)",
        "03 VR = Value Range: (value of white paper) minus (value of masstone color), with a 100 step value scale",
        "04 Gr = Granulation: 0 (liquid texture) to 4 (granular)",
        "05 Bl = Blossom: 0 (no blossom) to 4 (strong blossom)",
        "06 Df = Diffusion: 0 (inert) to 4 (very active diffusion)",
        "07 HA = Hue Angle in degrees of the CIELAB a*b* plane",
        "08 HS = Hue Shift = (undertone hue angle) minus (masstone hue angle), in degrees of the CIELAB a*b* plane",
        "09 Lf = Lightfastness: 1 (very fugitive) to 8 (very lightfast) for paint in tint,full strength",
        "Mentioned in pigment notes:",
        "    Chroma: For the masstone paint on white watercolor paper.",
        "    Drying Shift: Change in masstone color appearance from a glistening wet to completely dry paint swatch, in units of lightness, chroma and hue angle in CIELAB.",
        "For more information see 'What the Ratings Mean' (:handprint ratings)"
    ].join("\n"),

};

sites.handprint = handprint;

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────╮
// │ JacksonsArt.com │
// ╰─────────────────╯
const ja = {

    _site: "jacksonsart.com",

    gotoShippingInfo: async function(where="related") {
        return utils.tab.openAndRun(
            "https://www.jacksonsart.com/en-au/shipping-info",
            ()=>tri.controller.acceptExCmd(`artjs art.ja.showShippingInfo()`),
            where
        );
    },

};

sites.ja = ja;
