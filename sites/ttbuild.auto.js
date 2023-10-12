
const url = document.location.href;

// Remove clutter
rmall(".widget_text.widget_custom_html");

// Turn item headings into search links on DnDBeyond.com
$$("td:first-child>h4").forEach(e => {
    const link = document.createElement("a");
    link.href = `https://www.dndbeyond.com/search?q=${e.textContent}`;
    wrapin(e, link);
});

$$(".has-text-color").forEach(e => {
    const link = document.createElement("a");
    const s = e.textContent.replace(/^ *Level \d+: /, "").replace(/ \([★☆]+\)/, "");
    link.href = `https://www.dndbeyond.com/search?q=${s}`;
    wrapin(e, link);
});

const h3s = $$(".entry-content>h3")
      .filter(s => s.textContent.match(/ \([★☆]+\)/) || s?.firstChild.hasAttribute?.("id"));
h3s.forEach(e => {
    const link = document.createElement("a");
    const s = e.textContent.replace(/ \([★☆]+\)/, "");
    link.href = `https://www.dndbeyond.com/search?q=${s}`;
    wrapin(e, link);
});

const stars = [
    ["", ""],
    ["★☆☆☆☆", "#cc0000"],
    ["★★☆☆☆", "#ff7700"],
    ["★★★☆☆", "#e6ad00"],
    ["★★★★☆", "green"],
    ["★★★★★", "blue"],
];

const darkcolors = [
    ["", ""],
    ["★☆☆☆☆", "#330000"],
    ["★★☆☆☆", "#B35300"],
    ["★★★☆☆", "#806000"],
    ["★★★★☆", "#004000"],
    ["★★★★★", "#000080"],
];

function ratingIndex(rating) {
    const match = rating.match(/[★☆]+/)?.[0];
    switch (match) {
        case "★☆☆☆☆": return 1; break;
        case "★★☆☆☆": return 2; break;
        case "★★★☆☆": return 3; break;
        case "★★★★☆": return 4; break;
        case "★★★★★": return 5; break;
        default: return rating;
    }
}
function ratingColor(rating) {
    const n = ratingIndex(rating);
    return stars[n][1];
}

// Add rating colors in sidebar TOC lists
$$(".toc_widget_list li>a").forEach(a=>{
    const color = ratingColor(a.textContent);
    a.style.color = color;
});

// ───────────────────────────────────────────────────────────────────────────────
// ╭──────────────────────╮
// │ Optimized Feat Guide │
// ╰──────────────────────╯

if (url.match(/https:\/\/tabletopbuilds.com\/optimized-feat-guide-for-dd-5e/)) {
    /* link Feats heading to dndbeyond feats list */
    const hd = document.querySelector("h3.table_title");
    const hdLink = document.createElement("a");
    hdLink.textContent = hd.textContent;
    hd.textContent = "";
    hdLink.href = "https://www.dndbeyond.com/feats";
    hd.appendChild(hdLink);

    let table = document.getElementsByTagName("table")[0];
    let rows = [...table.rows].slice(2);
    const summarydiv = document.createElement("div");
    const searchbar = document.getElementById("search-3");
    searchbar.after(summarydiv);

    /* give each row an id attribute */
    rows.forEach(r => { r.id = r.cells[0].textContent.toLowerCase().replace(/ /g, "-"); });

    /* create summary table by rating */
    function tblByRating() {
        const summary = document.createElement("table");
        summarydiv.appendChild(summary);
        summary.id = "summary-table";
        summary.classList.add("by-rating");
        summary.classList.add("widget");

        const thead = document.createElement("thead");
        summary.appendChild(thead);
        let tr = document.createElement("tr");
        const rating_cell = document.createElement("th");
        rating_cell.textContent = "Rating";
        const feat_cell = document.createElement("th");
        feat_cell.textContent = "Feats";
        tr.appendChild(rating_cell);
        tr.appendChild(feat_cell);
        thead.appendChild(tr);
        const tbody = document.createElement("tbody");
        summary.appendChild(tbody);
        let i;
        for (i of [5,4,3,2,1]) {
            let tr = document.createElement("tr");
            tr.style.color = stars[i][1];
            tbody.appendChild(tr);
            let th = document.createElement("th");
            th.textContent = stars[i][0];
            tbody.rows[5-i].appendChild(th);
            let feats = document.createElement("th");
            tbody.rows[5-i].appendChild(feats);
        }

        rows.forEach(r=>{
            const name = r.cells[0].textContent;
            const rating = ratingIndex(r.cells[1].textContent);
            const color = darkcolors[rating][1];
            const feat_cell = tbody.rows[5-rating].children[1];
            const a = document.createElement("a");
            a.href = "#" + r.id;
            a.style.color = color;
            a.textContent = r.children[0].textContent.replace(/, $/, "");
            feat_cell.appendChild(a);
            const comma = document.createTextNode(", ");
            feat_cell.appendChild(comma);
        });
        [...tbody.rows].forEach(r => {
            const feat_cell = r.children[1];
            const last_node = feat_cell.lastChild;
            if (last_node.nodeType == 3) last_node.remove();
        });

    }

    /* create summary table by name */
    function tblByName() {
        const summary = document.createElement("table");
        summarydiv.appendChild(summary);
        summary.id = "summary-table";
        summary.classList.add("by-name");
        summary.classList.add("widget");
        // summary.style.lineHeight = "10px";

        const thead = document.createElement("thead");
        summary.appendChild(thead);
        let tr = document.createElement("tr");
        const feat_cell = document.createElement("th");
        feat_cell.textContent = "Feat";
        const rating_cell = document.createElement("th");
        rating_cell.textContent = "Rating";
        tr.appendChild(feat_cell);
        tr.appendChild(rating_cell);
        thead.appendChild(tr);
        const tbody = document.createElement("tbody");
        tbody.style.lineHeight = "10px";
        summary.appendChild(tbody);

        rows.forEach(r=>{
            let name = r.cells[0].textContent;
            let rating = r.cells[1].textContent;
            let rating_idx = ratingIndex(rating);
            let tr = document.createElement("tr");
            tr.style.color = stars[rating_idx][1];
            tr.setAttribute("onclick", `window.location = '#${r.id}'`);
            let feat_cell = document.createElement("th");
            feat_cell.style.color = darkcolors[rating_idx][1];
            feat_cell.textContent = name;
            let rating_cell = document.createElement("th");
            rating_cell.textContent = rating;
            tr.appendChild(feat_cell);
            tr.appendChild(rating_cell);
            tbody.appendChild(tr);
        });
    }

    function tblToggle() {
        const orig = document.getElementById("summary-table");
        if (orig) {
            const is_by_name = orig.classList.contains("by-name");
            orig.remove();
            if (is_by_name) tblByRating();
            else tblByName();
        } else tblByRating();
    }

    window.tblByRating = tblByRating;
    window.tblByName = tblByName;
    window.tblToggle = tblToggle;

    tblToggle();
}
