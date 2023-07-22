
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

function ratingIndex(rating) {
    const match = rating.match(/[★☆]+/)?.[0];
    switch (match) {
        case "★☆☆☆☆": return 1; break;
        case "★★☆☆☆": return 2; break;
        case "★★★☆☆": return 3; break;
        case "★★★★☆": return 4; break;
        case "★★★★★": return 5; break;
        default: return 0;
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

    /* create summary table */
    let table = document.getElementsByTagName("table")[0];
    let rows = [...table.rows].slice(2);
    const summary = document.createElement("table");
    summary.id = "summary-table";
    // table.parentElement.appendChild(summary);
    summary.classList.add("widget");
    const searchbar = document.getElementById("search-3");
    searchbar.after(summary);

    const thead = document.createElement("thead");
    summary.appendChild(thead);
    let tr = document.createElement("tr");
    const RatingCell = document.createElement("th");
    RatingCell.textContent = "Rating";
    const FeatCell = document.createElement("th");
    FeatCell.textContent = "Feats";
    tr.appendChild(RatingCell);
    tr.appendChild(FeatCell);
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
        let name = r.cells[0].textContent;
        let rating = ratingIndex(r.cells[1].textContent);
        tbody.rows[5-rating].children[1].textContent += `${name}, `;
    });
    [...tbody.rows].forEach(r => r.children[1].textContent = r.children[1].textContent.replace(/, $/, ""));
}
