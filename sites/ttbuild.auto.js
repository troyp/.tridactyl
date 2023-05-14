
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

// Add rating colors in sidebar TOC lists
$$(".toc_widget_list li>a").forEach(a=>{
    const match = a.textContent.trim().match(/\(([★☆]+)\)/);
    switch (match?.[1]) {
        case "★☆☆☆☆": a.style.color = "#cc0000"; break;
        case "★★☆☆☆": a.style.color = "#ff7700"; break;
        case "★★★☆☆": a.style.color = "#e6ad00"; break;
        case "★★★★☆": a.style.color = "green"; break;
        case "★★★★★": a.style.color = "blue"; break;
    }
});
