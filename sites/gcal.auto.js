// autocmd DocSqtart calendar\.google\.com js -r auto/gcal.js

// ───────────────────────────────────────────────────────────────────────────────
// ╭─────────────────╮
// │ colored buttons │
// ╰─────────────────╯
fade = ratio => component => 255-((255-component)/ratio);
rgb = (r,g,b)=>`rgb(${r}, ${g}, ${b})`;
const buttonFader = fade(5);

document.querySelectorAll("div[role=main] div[role=button]").forEach(e => {
    const dotcolor = e.firstChild.firstChild.style.borderColor || rgb(90,90,90);
    const rgbRE = /rgb\((\d+), *(\d+), *(\d+)\)/;
    const match = dotcolor.match(rgbRE);
    const components = match.slice(1).map(buttonFader);
    bgcolor = `rgb(${components})`;
    e.style.backgroundColor=bgcolor;
    e.style.border=`1px solid ${dotcolor}`;
});

// ───────────────────────────────────────────────────────────────────────────────
// ╭───────╮
// │ dates │
// ╰───────╯
// function datekeyToDate(key) {
//     /* # BITS: [year_rel(6)][month(4)][day(5)] */
//     const day = key & 0b11111;
//     const month = (key >> 5) & 0b1111;
//     const year_rel = key >> 9;
//     const year = 1970 + year_rel;
//     return new Date(year, month, day);
// }

function dateToDatekey(date) {
    const y = date.getFullYear() - 1970;
    const m = date.getMonth()+1;    /* getMonth() returns 0-based index */
    const d = date.getDate();
    return (y<<9) + (m<<5) + d;
}

const todayRGBArr = [255, 0, 0];
const todayFader = fade(15);
const datekey = dateToDatekey(new Date());
const todayHeading = document.querySelector(`div[role=main] div>h2[data-datekey="${datekey}"]`);
todayHeading.parentElement.style.backgroundColor = rgb(...todayRGBArr.map(todayFader));
todayHeading.parentElement.style.border = `2px solid ${rgb(...todayRGBArr)}`;
