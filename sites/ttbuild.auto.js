
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
