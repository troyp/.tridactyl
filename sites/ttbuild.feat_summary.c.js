
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

let table = document.getElementsByTagName("table")[0];
let rows = [...table.rows].slice(2);
const summary = document.createElement("table");
summary.id = "summary-table";
table.parentElement.appendChild(summary);
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
