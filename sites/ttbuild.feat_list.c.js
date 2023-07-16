function ratingColor(rating) {
    const match = rating.match(/[★☆]+/)?.[0];
    switch (match) {
        case "★☆☆☆☆": return "#cc0000"; break;
        case "★★☆☆☆": return "#ff7700"; break;
        case "★★★☆☆": return "#e6ad00"; break;
        case "★★★★☆": return "green"; break;
        case "★★★★★": return "blue"; break;
        default: return "";
    }
}

let table = document.getElementsByTagName("table")[0];
let list = document.createElement("ul");
let rows = [...table.rows].slice(2);
table.parentElement.appendChild(list);
list.id = "table-summary";
rows.forEach(r=>{
    let li = document.createElement("li");
    let name = r.cells[0].textContent;
    let rating = r.cells[1].textContent;
    let color = ratingColor(rating);
    li.innerHTML = `<li style="color:${color}">${name} ${rating}</li>`;
    list.appendChild(li);
    list.scrollIntoView();
});
