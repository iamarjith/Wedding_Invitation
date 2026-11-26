const c = WEDDING, main = document.querySelector('main');
document.title = c.title;
const TEXT_LAYOUT = c.textLayout;
for (const [key, path] of Object.entries(c.cssImages || {})) document.documentElement.style.setProperty('--asset-'+key, `url(${JSON.stringify(path)})`);
function changed(spec, original) { return ['text','fontSize','color','fontStyle','fontFamily','fontWeight','left','top','width','height','textAlign','lineHeight','letterSpacing'].some(k => spec[k] != null && spec[k] !== original[k]) || spec.visible === false; }
const enabled = n => c['step' + n].publish !== false;
const escapeHTML = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
function applyStyle(el, spec = {}) {
    if (!el) return;
    for (const key of ['top','left','width','height']) if (spec[key] != null) el.style[key] = spec[key] + '%';
    if (spec.fontSize != null) el.style.fontSize = spec.fontSize + 'cqw';
    for (const key of ['fontFamily','fontWeight','color','lineHeight','letterSpacing','textAlign','fontStyle']) if (spec[key] != null) el.style[key] = spec[key];
    if (spec.visible === false) el.style.display = 'none';
}
function fixedText(section, items, screen, welcome = false) {
    for (const [key, original] of Object.entries(TEXT_LAYOUT[screen] || {})) {
        const spec = items?.[key]; if (!spec || !original.patch) continue; if (key === "tapText" || key === "mapText") continue;
        if (!changed(spec, original)) continue;
        const layer = document.createElement('div');
        layer.className = 'fixed-text' + (welcome ? ' config-welcome' : screen === 0 ? ' config-closed' : '');
        for (const k of ['left','top','width','height']) layer.style[k] = (spec[k] ?? original[k]) + '%';
        const patch = document.createElement('img'); patch.src = spec.patch || original.patch; patch.alt = ''; layer.append(patch);
        const text = document.createElement('span'); text.textContent = spec.visible === false ? '' : spec.text;
        text.style.fontSize = spec.fontSize + 'cqw'; text.style.color = original.color; text.style.fontStyle = original.fontStyle;
        applyStyle(text, {...spec, left:null, top:null, width:null, height:null, visible:true}); layer.append(text); section.append(layer);
    }
}
function overlays(section, items, welcome = false) {
    for (const spec of items || []) {
        const el = document.createElement('div');
        el.className = 'config-text' + (welcome ? ' config-welcome' : '');
        el.textContent = spec.text || '';
        applyStyle(el, spec);
        section.append(el);
    }
}
const page = (i) => {
    let s = document.createElement('section');
    s.className = 'page step-' + (i === 0 ? 0 : i - 1);
    s.innerHTML = `<img class="art" ${i === 0 ? 'src' : 'data-src'}="${c['step' + (i === 0 ? 0 : i - 1)].background}" ${i === 0 ? 'fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'} alt="Wedding invitation stage ${i}">`;
    const step = c['step' + (i === 0 ? 0 : i - 1)];
    for (const item of [...(step.foreground || []), ...(step.couplePhoto ? [step.couplePhoto] : [])]) {
        if (item.visible === false) continue;
        const spec = step.text?.[item.id];
        const original = TEXT_LAYOUT[i]?.[item.id];
        if (spec && original && changed(spec, original)) {
            if (spec.visible !== false) { const el = document.createElement('div'); el.className='config-text modular-text'; el.textContent=spec.text; applyStyle(el,{left:item.left,top:item.top,width:item.displayWidth,height:item.displayHeight,color:original.color,fontStyle:original.fontStyle,...spec}); s.append(el); } continue;
        }
        const img = document.createElement('img');
        img.alt = ''; img.dataset.src = item.src; img.loading = 'lazy'; img.fetchPriority = 'low';
        Object.assign(img.style, {position:'absolute',left:item.left+'%',top:item.top+'%',width:item.displayWidth+'%',height:item.displayHeight+'%',pointerEvents:'none',opacity:item.opacity ?? 1,objectFit:item.fit || 'fill'});
        s.append(img);
    }
    const bg = s.querySelector(".art"); bg.style.opacity = step.backgroundStyle?.opacity ?? 1; if(step.backgroundStyle?.fit) bg.style.objectFit=step.backgroundStyle.fit; if(step.backgroundStyle?.color) s.style.backgroundColor=step.backgroundStyle.color;
    main.append(s);
    return s;
};
let first = enabled(0) ? page(0) : null;
if (first) {
first.classList.add('opening');
first.style.setProperty('--opening', c.step0.openingMs + 'ms');
first.insertAdjacentHTML('beforeend', `<img class="art welcome" src="${c.step0.welcomeBackground}" fetchpriority="high" alt="Welcome"><canvas class="particles"></canvas><button class="hot tap" aria-label="${escapeHTML(c.step0.text.tapText.text)}">${escapeHTML(c.step0.text.tapText.text)}</button>`);
applyStyle(first.querySelector('button'), {fontSize:c.step0.text.tapText.fontSize, visible:c.step0.text.tapText.visible});
first.querySelector('button').onclick = async () => {
    if (first.classList.contains('open'))
        return;
    activateMusic();
    if (first.dataset.openingPending) return;
    first.dataset.openingPending = 'true';
    try { await first.querySelector('.welcome').decode(); } catch (_) {}
    first.classList.add('open');
    document.body.classList.remove('locked');
    startMagic();
    startGuestAutoScroll();
    let cv = first.querySelector('canvas'), x = cv.getContext('2d');
    cv.width = first.clientWidth * 2;
    cv.height = first.clientHeight * 2;
    let p = Array.from({ length: 450 }, () => ({ x: (.16 + Math.random() * .68) * cv.width, y: (.24 + Math.random() * .58) * cv.height, vx: (Math.random() - .5) * 2, vy: (Math.random() - .5) * 2, r: Math.random() < .08 ? 4 : Math.random() * 1.7 + .4 })), start = performance.now();
    function frame(t) {
        let f = (t - start) / c.step0.openingMs;
        x.clearRect(0, 0, cv.width, cv.height);
        if (f >= 1) {
            return;
        }
        x.globalAlpha = Math.sin(Math.PI * f);
        for (let a of p) {
            a.x += a.vx;
            a.y += a.vy;
            x.fillStyle = '#ffe49a';
            x.shadowColor = '#ffbf28';
            x.shadowBlur = 7;
            x.beginPath();
            x.arc(a.x, a.y, a.r, 0, 7);
            x.fill();
        }
        requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
};
}
let pages = {};
for (let i = 2; i < 9; i++)
    if (enabled(i - 1)) pages[i - 1] = page(i);
let s = pages[4];
if (s) {

let d = new Date(c.step4.date), fmt = (o) => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', ...o }).format(d);
s.insertAdjacentHTML('beforeend', `<div class="scratch"><div class="date"><span>${fmt({ weekday: 'long' })}</span><strong>${fmt({ day: 'numeric', month: 'long', year: 'numeric' })}</strong><span>${escapeHTML(c.step4.muhurthamLabel)}: ${fmt({ hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase()}</span></div><canvas aria-label="Scratch to reveal wedding date"></canvas></div><img class="countdown-heading" src="${escapeHTML(c.step4.countdownHeadingImage)}" alt="Countdown to Our Big Day"><div class="scroll"><div class="scroll-body" aria-hidden="true"></div><div class="time">${c.step4.countdownLabels.map(label => `<span><b>00</b><small>${escapeHTML(label)}</small></span>`).join('')}</div><div class="roller upper"></div><div class="roller lower"></div></div><a class="hot calendar" aria-label="Save to Google Calendar" target="_blank" rel="noopener noreferrer"><img src="${escapeHTML(c.step4.calendarImage)}" alt="Save to Calendar"></a><img class="calendar-caption" src="${escapeHTML(c.step4.calendarCaptionImage)}" alt="Mark Your Calendar">`);
let cv = s.querySelector('.scratch canvas'), ctx = cv.getContext('2d', { willReadFrequently: true }), done = false;
cv.width = 900;
cv.height = 340;
// Track coverage independently of canvas readback (also works on file:// previews).
const mask = Uint8Array.from(atob('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAAABAQEAAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAQAAAAEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQABAQEBAQEBAQEBAQEBAAABAQEBAAAAAAABAQEAAAABAQEBAQEBAAEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAEAAAAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQABAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEBAQAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAABAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAQEBAQEBAQEBAQEAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAQEBAAEBAQEBAQAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAQEAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAAAAAAAAAAAAAQABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQAAAAAAAAAAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAEAAAABAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAEAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAAAAAAAAAAAAAAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQEAAAAAAAAAAAAAAAAAAAAAAAAAAQEBAQAAAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAAAAAAABAQAAAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAAQAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQABAQABAAEBAAAAAAABAQEBAQEAAQAAAAAAAAAAAAAAAQEBAAAAAAABAQEBAQEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEBAQAAAAEBAQEBAQEBAQEBAQAAAAAAAAAAAAAAAAAAAAAA'), ch => ch.charCodeAt(0));
const initial = mask.reduce((sum, v) => sum + v, 0);
let ready = false, active = false, last = null, erased = 0;
const cover = new Image();
cover.onload = async () => {
    const base = new Image();
    base.src = c.step4.background;
    try { await base.decode(); } catch (_) { return; }
    const area = cv.parentElement, pageRect = s.getBoundingClientRect(), r = area.getBoundingClientRect();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#fff1d6'; ctx.fillRect(0, 0, 900, 340);
    ctx.drawImage(base, (r.left-pageRect.left)/pageRect.width*base.naturalWidth,
        (r.top-pageRect.top)/pageRect.height*base.naturalHeight,
        r.width/pageRect.width*base.naturalWidth, r.height/pageRect.height*base.naturalHeight,
        0, 0, 900, 340);
    ctx.drawImage(cover, 0, 0, 900, 340);
    ready = true;
};
cover.onerror = () => { finishScratch(); };
cover.src = c.step4.scratchImage;
function finishScratch() {
    if (done) return;
    done = true;
    cv.remove();
    s.querySelector('.scratch').classList.add('done');
    s.querySelector('.scroll').classList.add('open');
    tick();
    setInterval(tick, 1000);
}
function scratch(e) {
    if (!active || done || !ready) return;
    const r = cv.getBoundingClientRect();
    const p = [(e.clientX-r.left)*900/r.width,(e.clientY-r.top)*340/r.height];
    const q = last || p;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineWidth = 85;
    ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(...q); ctx.lineTo(...p); ctx.stroke();
    ctx.beginPath(); ctx.arc(...p,42.5,0,Math.PI*2); ctx.fill();
    const dx=p[0]-q[0],dy=p[1]-q[1],len=dx*dx+dy*dy;
    for(let y=0;y<34;y++) for(let x=0;x<90;x++) {
        const i=y*90+x; if(!mask[i]) continue;
        const px=x*10+5-q[0],py=y*10+5-q[1];
        const t=len?Math.max(0,Math.min(1,(px*dx+py*dy)/len)):0;
        if((px-t*dx)**2+(py-t*dy)**2<=42.5**2){mask[i]=0;erased++;}
    }
    last=p;
    if(erased/initial>=c.step4.scratchThreshold) finishScratch();
}
cv.onpointerdown = e => {
    if(!ready || done) return;
    active=true; last=null; e.preventDefault();
    s.querySelector('.scratch').classList.add('scratching');
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    scratch(e);
};
cv.onpointermove=scratch;
cv.tabIndex = 0;
cv.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finishScratch(); } });
cv.onpointerup=cv.onpointercancel=cv.onlostpointercapture=()=>{active=false;last=null;};
function tick() {
    let t = Math.max(0, Math.floor((d - Date.now()) / 1000));
    [Math.floor(t / 86400), Math.floor(t / 3600) % 24, Math.floor(t / 60) % 60, t % 60].forEach((v, i) => {
        s.querySelectorAll('.time b')[i].textContent = String(v).padStart(2, '0');
    });
}
{ 
    const stamp = date => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const end = new Date(d.getTime() + c.step4.calendarDurationMinutes * 60000);
    const params = new URLSearchParams({action:'TEMPLATE', text:c.names + ' Wedding', dates:stamp(d)+'/'+stamp(end), ctz:'Asia/Kolkata', location:c.step5.text.venueName.text+', '+c.step5.text.venueAddress.text});
    s.querySelector('.calendar').href = 'https://calendar.google.com/calendar/render?'+params;
    s.querySelector('.calendar').removeAttribute('target'); // same-tab navigation permits OS universal-link handling where supported
}
applyStyle(s.querySelector('.date'), c.step4.dateStyle);
applyStyle(s.querySelector('.time'), c.step4.countdownStyle);
applyStyle(s.querySelector('.calendar'), c.step4.calendarStyle);
}
if (pages[5]) {
pages[5].insertAdjacentHTML('beforeend', '<button class="hot location" aria-label="Open wedding location in Maps">Location</button>');
pages[5].querySelector('button').onclick = () => window.open(c.step5.mapUrl || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(c.step5.text.venueName.text + ', ' + c.step5.text.venueAddress.text), '_blank', 'noopener');
pages[5].querySelector('button').textContent = c.step5.text.mapText.text;
}
if (pages[7]) pages[7].insertAdjacentHTML('beforeend', '<div class="lotus"></div>');
function startMagic() {
    if (document.querySelector('.global-magic'))
        return;
    const canvas = document.createElement('canvas');
    canvas.className = 'global-magic';
    document.body.append(canvas);
    const g = canvas.getContext('2d');
    let w, h, particles = [];
    function resize() {
        w = main.clientWidth;
        h = innerHeight;
        const ratio = Math.min(devicePixelRatio || 1, 2);
        canvas.style.width = w + "px";
        canvas.width = w * ratio;
        canvas.height = h * ratio;
        g.setTransform(ratio, 0, 0, ratio, 0, 0);
        particles = Array.from({ length: 78 }, (_, i) => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .65, vy: (Math.random() - .5) * .65, r: i < 55 ? .75 : i < 70 ? 1 : 1.5, phase: Math.random() * 6.28 }));
    }
    resize();
    addEventListener('resize', resize);
    function draw(t) {
        g.clearRect(0, 0, w, h);
        for (const p of particles) {
            p.x = (p.x + p.vx + Math.sin(t / 1800 + p.phase) * .15 + w) % w;
            p.y = (p.y + p.vy + Math.cos(t / 2100 + p.phase) * .15 + h) % h;
            g.globalAlpha = .30 + .42 * (1 + Math.sin(t / 800 + p.phase)) / 2;
            g.fillStyle = '#ffcc55';
            g.shadowColor = '#eaa400';
            g.shadowBlur = 1.8;
            g.beginPath();
            g.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            g.fill();
        }
        requestAnimationFrame(draw);
    }
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
        draw(performance.now());
}
// Keep the viewport at the entrance until the original transition completes.
addEventListener("scroll", () => {
    if (document.body.classList.contains("locked") && scrollY)
        scrollTo(0, 0);
}, { passive: true });
// Editable family names, positioned over the original artwork.
function nameLine(page, cls, spec) {
    const el = document.createElement('div');
    el.className = 'family-name ' + cls;
    el.textContent = spec.text;
    applyStyle(el, spec);
    page.append(el);
}
if (pages[1]) {
    nameLine(pages[1], 'groom-name', c.step1.groom);
    nameLine(pages[1], 'groom-parents', c.step1.groomParents);
    nameLine(pages[1], 'bride-name', c.step1.bride);
    nameLine(pages[1], 'bride-parents', c.step1.brideParents);
}
// Fit editable calligraphy within its original column without changing the layout.
function fitFamilyNames() {
    document.querySelectorAll('.groom-name,.bride-name').forEach(el => {
        const spec = el.classList.contains('groom-name') ? c.step1.groom : c.step1.bride;
        el.style.fontSize = spec.fontSize + 'cqw';
        let size = parseFloat(getComputedStyle(el).fontSize);
        while (el.scrollWidth > el.clientWidth && size > 8) {
            size -= 0.5;
            el.style.fontSize = size + 'px';
        }
    });
}
requestAnimationFrame(fitFamilyNames);
if (document.fonts)
    document.fonts.ready.then(fitFamilyNames);
addEventListener('resize', fitFamilyNames);
if (pages[1] && c.step1.groom.useOriginalArt && c.step1.groom.text === 'Amarjith Das' && c.step1.groom.fontSize === 9.1)
    document.querySelector('.groom-name').classList.add('name-art');
if (pages[1] && c.step1.bride.useOriginalArt && c.step1.bride.text === 'Pitta Jyothi' && c.step1.bride.fontSize === 9.1)
    document.querySelector('.bride-name').classList.add('name-art');
// Guest auto-scroll: one uninterrupted session, permanently cancelled by input.
function startGuestAutoScroll() {
    if (!c.autoScroll.enabled) return;
    const sequence = [first, ...Object.values(pages)].filter(Boolean);
    let stopped = false, timer = 0, raf = 0, index = 0;
    const stop = () => {
        stopped = true;
        clearTimeout(timer);
        cancelAnimationFrame(raf);
    };
    for (const event of ['pointerdown', 'touchstart', 'wheel', 'keydown', 'click']) {
        window.addEventListener(event, stop, { capture: true, passive: true });
    }
    // The opening click has already passed the capture phase; it does not cancel.
    const hold = () => {
        if (!stopped && index < sequence.length - 1)
            timer = setTimeout(advance, c.autoScroll.holdMs);
    };
    function advance() {
        if (stopped)
            return;
        const target = sequence[++index];
        const from = window.scrollY, to = Math.min(target.getBoundingClientRect().top + from, document.documentElement.scrollHeight - innerHeight);
        const start = performance.now();
        function move(now) {
            if (stopped)
                return;
            const t = Math.min(1, (now - start) / c.autoScroll.moveMs), eased = t * t * (3 - 2 * t);
            window.scrollTo({ top: from + (to - from) * eased, left: 0, behavior: 'instant' });
            if (t < 1)
                raf = requestAnimationFrame(move);
            else
                hold();
        }
        raf = requestAnimationFrame(move);
    }
    timer = setTimeout(hold, first ? c.step0.openingMs : 0);
}
if (pages[1]) pages[1].insertAdjacentHTML("beforeend", '<img class="family-ampersand" src="' + escapeHTML(c.step1.ampersandImage) + '" alt="and">');

// Reveal the entrance as a complete composition, never as separate layers.
async function revealEntrance() {
    const images = first ? [...first.querySelectorAll('img')] : [];
    try {
        await Promise.allSettled(images.filter(img => !img.classList.contains("welcome")).map(img => img.decode()));
        document.body.classList.remove('initial-loading');
        // Start remaining artwork downloads only after the entrance is ready.
        for (const img of main.querySelectorAll('img[loading="lazy"]')) {
            if (img.dataset.src) img.src = img.dataset.src;
            delete img.dataset.src;
        }
    } catch (error) {
        document.body.classList.remove('initial-loading');
        console.error(error);
    }
}
if (first) {
    fixedText(first, c.step0.text, 0);
    fixedText(first, c.step0.welcomeText, 1, true);
    overlays(first, c.step0.overlays);
    overlays(first, c.step0.welcomeOverlays, true);
}
for (const [n, section] of Object.entries(pages)) { fixedText(section, Object.fromEntries(Object.entries(c['step'+n].text || {}).filter(([k]) => !(c['step'+n].foreground || []).some(x=>x.id===k))), Number(n)+1); overlays(section, c['step' + n].overlays); }
if (!first) document.body.classList.remove('locked');
revealEntrance().then(() => {
    if (!first && Object.keys(pages).length) { startMagic(); startGuestAutoScroll(); }
});

// One viewport-fixed music toggle; audio begins only on a guest gesture.
const musicConfig = c.music || {};
let musicAudio, musicButton;
function activateMusic() {
    if (!musicConfig.enabled) return;
    if (!musicConfig.src) {
        if (!musicButton && musicConfig.showControl !== false) {
            musicButton = document.createElement("button");
            musicButton.className = "music-toggle";
            musicButton.style.setProperty("--music-size", (musicConfig.iconSize || 24) + "px");
            musicButton.setAttribute("aria-label", "Music not configured");
            musicButton.title = "Music not configured";
            musicButton.disabled = true;
            musicButton.innerHTML = `<span><svg viewBox="0 0 24 24"><path fill="currentColor" d="M3 9h4l5-4v14l-5-4H3z"/><path d="m15 9 6 6m0-6-6 6"/></svg></span>`;
            document.body.append(musicButton);
        }
        return;
    }
    if (!musicAudio) {
        musicAudio = new Audio(musicConfig.src);
        musicAudio.currentTime = 0;
        musicAudio.loop = musicConfig.loop !== false;
        musicAudio.volume = musicConfig.volume ?? 0.35;
        musicButton = document.createElement('button');
        musicButton.className = 'music-toggle';
        musicButton.style.setProperty('--music-size', (musicConfig.iconSize || 24) + 'px');
        const update = () => { const muted = musicAudio.paused || musicAudio.muted; musicButton.setAttribute('aria-label', muted ? 'Play music' : 'Mute music'); musicButton.innerHTML = `<span><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9h4l5-4v14l-5-4H3z"/>${muted ? '<path d="m15 9 6 6m0-6-6 6"/>' : '<path d="M15 8q5 4 0 8m3-11q8 7 0 14"/>'}</svg></span>`; };
        musicButton.onclick = () => { if (musicAudio.paused) { musicAudio.muted = false; musicAudio.play().catch(update); } else { musicAudio.muted = !musicAudio.muted; } update(); };
        for (const event of ['play','pause','volumechange','error']) musicAudio.addEventListener(event, update);
        if (musicConfig.showControl !== false) document.body.append(musicButton);
        update();
        if (musicConfig.autoplayOnOpen !== false) musicAudio.play().catch(update);
    }
}
if (!first && musicConfig.enabled) document.addEventListener('pointerdown', activateMusic, {once:true});

if (!first && musicConfig.enabled && !musicConfig.src) activateMusic();

// Stop and reset on document navigation, including back-forward cache.
window.addEventListener("pagehide", () => { if (musicAudio) { musicAudio.pause(); musicAudio.currentTime = 0; } });
