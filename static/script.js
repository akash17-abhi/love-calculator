/* ═══════════════════════════════════════
   LOVE CALCULATOR — script.js
   Features: floating hearts, cursor trail,
   card tilt, traits, mood badge, share
═══════════════════════════════════════ */

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
    generateParticles();
    initFloatingHearts();
    setMaxDate();
    injectSvgDefs();

    // Desktop-only effects
    if (window.matchMedia('(pointer: fine)').matches) {
        initCursorTrail();
        initCardTilt();
    }
});

document.getElementById('loveForm').addEventListener('submit', (e) => {
    e.preventDefault();
    calculateLove();
});

/* ── SVG gradient for score ring ── */
function injectSvgDefs() {
    const svg = document.querySelector('.score-svg');
    if (!svg) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = buildGradientDef('#f43f5e', '#f472b6', '#e11d48');
    svg.prepend(defs);
}

function buildGradientDef(c1, c2, c3) {
    return `<linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%"   stop-color="${c1}"/>
        <stop offset="50%"  stop-color="${c2}"/>
        <stop offset="100%" stop-color="${c3}"/>
    </linearGradient>`;
}

function updateScoreGradient(pct) {
    const defs = document.querySelector('.score-svg defs');
    if (!defs) return;
    if (pct >= 75)      defs.innerHTML = buildGradientDef('#f43f5e', '#f472b6', '#e11d48'); // rose
    else if (pct >= 55) defs.innerHTML = buildGradientDef('#f97316', '#fbbf24', '#ea580c'); // amber
    else if (pct >= 35) defs.innerHTML = buildGradientDef('#8b5cf6', '#a78bfa', '#7c3aed'); // violet
    else                defs.innerHTML = buildGradientDef('#3b82f6', '#60a5fa', '#2563eb'); // blue
}

/* ── Max date ── */
function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date1').max = today;
    document.getElementById('date2').max = today;
}

/* ══════════════════════════════════════
   BACKGROUND PARTICLES
══════════════════════════════════════ */
function generateParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 2.5 + 0.5;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            left:${Math.random()*100}%; top:${Math.random()*100}%;
            --dur:${(Math.random()*4+2).toFixed(1)}s;
            --delay:${(Math.random()*5).toFixed(1)}s;
            --max-op:${(Math.random()*0.4+0.08).toFixed(2)};`;
        container.appendChild(p);
    }
}

/* ══════════════════════════════════════
   FLOATING AMBIENT HEARTS
══════════════════════════════════════ */
function initFloatingHearts() {
    const container = document.getElementById('bgHearts');
    if (!container) return;

    const heartSvg = (op, sz) => `<svg width="${sz}" height="${sz}" viewBox="0 0 100 90" fill="none">
        <path d="M50 85 C50 85 5 55 5 25 C5 10 15 2 27 2 C37 2 45 8 50 16 C55 8 63 2 73 2 C85 2 95 10 95 25 C95 55 50 85 50 85Z"
              fill="rgba(244,99,120,${op})"/></svg>`;

    const cfgs = [
        { l:'4%',  sz:18, op:0.09, dur:14, del:0 },
        { l:'13%', sz:12, op:0.06, dur:19, del:-5 },
        { l:'23%', sz:22, op:0.11, dur:12, del:-9 },
        { l:'33%', sz:15, op:0.07, dur:17, del:-2 },
        { l:'44%', sz:20, op:0.08, dur:21, del:-11 },
        { l:'54%', sz:14, op:0.07, dur:16, del:-7 },
        { l:'64%', sz:24, op:0.10, dur:13, del:-4 },
        { l:'74%', sz:16, op:0.06, dur:18, del:-8 },
        { l:'84%', sz:20, op:0.09, dur:11, del:-3 },
        { l:'93%', sz:13, op:0.07, dur:15, del:-6 },
    ];

    cfgs.forEach(c => {
        const div = document.createElement('div');
        div.className = 'float-heart';
        div.innerHTML = heartSvg(c.op, c.sz);
        div.style.cssText = `left:${c.l}; --dur:${c.dur}s; --delay:${c.del}s;`;
        container.appendChild(div);
    });
}

/* ══════════════════════════════════════
   CURSOR HEART TRAIL
══════════════════════════════════════ */
function initCursorTrail() {
    const container = document.getElementById('cursorTrail');
    if (!container) return;
    let lastTime = 0;

    document.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastTime < 55) return;
        lastTime = now;

        const heart = document.createElement('div');
        heart.className = 'trail-heart';
        heart.textContent = ['♥', '♡', '❤'][Math.floor(Math.random() * 3)];
        const sz = 10 + Math.random() * 9;
        heart.style.cssText = `
            left:${e.clientX - sz/2}px;
            top:${e.clientY - sz/2}px;
            font-size:${sz}px;
            color:hsl(${338 + Math.random()*22}, 88%, ${58 + Math.random()*20}%);`;
        container.appendChild(heart);
        setTimeout(() => heart.remove(), 850);
    });
}

/* ══════════════════════════════════════
   3D CARD TILT ON HOVER
══════════════════════════════════════ */
function initCardTilt() {
    const applyTilt = (card) => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width  - 0.5;
            const y = (e.clientY - rect.top)  / rect.height - 0.5;
            card.style.transform = `perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) scale(1.015)`;
            card.style.boxShadow = `
                0 32px 80px rgba(0,0,0,0.5),
                0 0 0 1px rgba(255,255,255,0.055),
                ${x*-20}px ${y*-20}px 60px rgba(244,63,94,0.18)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s ease, box-shadow 0.55s ease';
            card.style.transform  = '';
            card.style.boxShadow  = '';
            setTimeout(() => { card.style.transition = ''; }, 560);
        });
        card.addEventListener('mouseenter', () => {
            card.style.transition = '';
        });
    };

    document.querySelectorAll('.card, .result-card').forEach(applyTilt);
}

/* ══════════════════════════════════════
   TOAST NOTIFICATION
══════════════════════════════════════ */
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════
   CALCULATION
══════════════════════════════════════ */
function calculateLove() {
    const name1 = document.getElementById('name1').value.trim();
    const date1 = document.getElementById('date1').value;
    const name2 = document.getElementById('name2').value.trim();
    const date2 = document.getElementById('date2').value;

    if (!name1) { showToast('Please enter your name'); return; }
    if (!date1) { showToast('Please enter your date of birth'); return; }
    if (!name2) { showToast("Please enter your beloved's name"); return; }
    if (!date2) { showToast("Please enter your beloved's date of birth"); return; }

    showLoading();

    fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name1, date1, name2, date2 })
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => { hideLoading(); displayResults(data, name1, name2); })
    .catch(() => { hideLoading(); showToast('Something went wrong. Please try again.'); });
}

/* ══════════════════════════════════════
   DISPLAY RESULTS
══════════════════════════════════════ */
function displayResults(data, name1, name2) {
    const target = data.love_percentage;

    // Names
    document.getElementById('rName1').textContent = name1;
    document.getElementById('rName2').textContent = name2;

    // Show result card (force animation restart)
    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('active');
    void resultCard.offsetHeight; // force reflow
    resultCard.classList.add('active');
    document.getElementById('inputCard').classList.add('hidden');

    // Update score ring gradient color based on tier
    updateScoreGradient(target);

    // Animate score ring + counter (small delay so CSS transitions register)
    setTimeout(() => {
        const circumference = 314;
        document.getElementById('scoreTrack').style.strokeDashoffset =
            circumference - (target / 100) * circumference;
    }, 80);

    animateCount(document.getElementById('scoreNumber'), 0, target, 2500);
    animateCountText(document.getElementById('meterValue'), 0, target, 2500, '%');

    // Meter bar
    setTimeout(() => {
        document.getElementById('meterFill').style.width = target + '%';
    }, 80);

    // Text fields
    document.getElementById('resultMessage').textContent = data.message;
    document.getElementById('zodiac1').textContent = data.zodiac1;
    document.getElementById('zodiac2').textContent = data.zodiac2;
    document.getElementById('quoteText').textContent = data.quote;

    // Mood badge
    setMoodBadge(target);

    // Traits
    const traits = calculateTraits(name1, name2, target);
    setTimeout(() => animateTraits(traits), 700);

    // Confetti burst
    setTimeout(launchConfetti, 400);

    // Scroll
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/* ══════════════════════════════════════
   MOOD BADGE
══════════════════════════════════════ */
function setMoodBadge(pct) {
    const moods = [
        { min: 90, emoji: '🌟', text: 'Destined for each other' },
        { min: 80, emoji: '💕', text: 'A match made in heaven' },
        { min: 70, emoji: '💑', text: 'Great romantic connection' },
        { min: 60, emoji: '💖', text: 'Strong chemistry between you' },
        { min: 50, emoji: '💗', text: 'Good potential together' },
        { min: 38, emoji: '🌸', text: 'Love is blossoming' },
        { min:  0, emoji: '🌙', text: 'Every love story is unique' },
    ];
    const mood = moods.find(m => pct >= m.min) || moods[moods.length - 1];
    document.getElementById('moodEmoji').textContent = mood.emoji;
    document.getElementById('moodText').textContent  = mood.text;
}

/* ══════════════════════════════════════
   TRAITS BREAKDOWN
══════════════════════════════════════ */
function calculateTraits(name1, name2, lovePct) {
    const seed = [...(name1 + name2).toLowerCase()]
        .reduce((s, c) => s + c.charCodeAt(0), 0);

    const derive = (shift, range) => {
        const raw = lovePct + ((seed >> shift) & 0x1F) % range - range / 2;
        return Math.min(99, Math.max(18, Math.round(raw)));
    };

    return {
        passion:   derive(0, 32),
        trust:     derive(4, 28),
        chemistry: derive(8, 30),
        bond:      derive(12, 26),
    };
}

function animateTraits(traits) {
    const items = [
        { pct: traits.passion,   fillId: 'fPassion', textId: 'tPassion', delay: 0 },
        { pct: traits.trust,     fillId: 'fTrust',   textId: 'tTrust',   delay: 100 },
        { pct: traits.chemistry, fillId: 'fChem',    textId: 'tChem',    delay: 200 },
        { pct: traits.bond,      fillId: 'fBond',     textId: 'tBond',    delay: 300 },
    ];

    items.forEach(({ pct, fillId, textId, delay }) => {
        setTimeout(() => {
            document.getElementById(fillId).style.width = pct + '%';
            animateCountText(document.getElementById(textId), 0, pct, 1800, '%');
        }, delay);
    });
}

/* ══════════════════════════════════════
   SHARE / COPY
══════════════════════════════════════ */
function shareResult() {
    const name1 = document.getElementById('rName1').textContent;
    const name2 = document.getElementById('rName2').textContent;
    const pct   = document.getElementById('scoreNumber').textContent;
    const msg   = `${name1} ❤️ ${name2}\nLove Compatibility: ${pct}%\n\nTested with Love Calculator 💕`;

    if (navigator.share) {
        navigator.share({ title: 'Our Love Score 💕', text: msg })
            .catch(() => copyText(msg));
    } else {
        copyText(msg);
    }
}

function copyText(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Copied to clipboard! 💕'))
        .catch(() => showToast('Could not copy — try manually'));
}

/* ══════════════════════════════════════
   CONFETTI
══════════════════════════════════════ */
function launchConfetti() {
    const wrap = document.getElementById('confettiWrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const colors = ['#f43f5e','#f472b6','#fb7185','#fda4af','#ffd6e0','#fff1f2','#e11d48','#ec4899','#fbbf24'];

    for (let i = 0; i < 50; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';

        const angle = Math.random() * 360;
        const dist  = 80 + Math.random() * 180;
        const tx    = Math.cos(angle * Math.PI / 180) * dist;
        const ty    = -(70 + Math.random() * 160);

        piece.style.cssText = `
            left:${38 + Math.random()*24}%;
            top:${25 + Math.random()*12}%;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:${Math.random()>0.5?'50%':'3px'};
            width:${4+Math.random()*6}px; height:${4+Math.random()*6}px;
            --tx:${tx}px; --ty:${ty}px;
            --dur:${(1.3+Math.random()*1.1).toFixed(1)}s;
            --delay:${(Math.random()*0.4).toFixed(2)}s;
            --rot:${Math.round(Math.random()*720-360)}deg;`;
        wrap.appendChild(piece);
    }

    setTimeout(() => { wrap.innerHTML = ''; }, 3000);
}

/* ══════════════════════════════════════
   ANIMATION HELPERS
══════════════════════════════════════ */
function animateCount(el, from, to, duration) {
    const start = performance.now();
    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * ease);
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function animateCountText(el, from, to, duration, suffix = '') {
    const start = performance.now();
    const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * ease) + suffix;
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

/* ══════════════════════════════════════
   UI STATE
══════════════════════════════════════ */
function showLoading() {
    document.getElementById('inputCard').classList.add('hidden');
    document.getElementById('resultCard').classList.remove('active');
    document.getElementById('loadingState').classList.add('active');
}

function hideLoading() {
    document.getElementById('loadingState').classList.remove('active');
}

function resetForm() {
    document.getElementById('loveForm').reset();

    const resultCard = document.getElementById('resultCard');
    resultCard.classList.remove('active');
    document.getElementById('inputCard').classList.remove('hidden');

    // Reset animated values
    document.getElementById('meterFill').style.width   = '0%';
    document.getElementById('scoreTrack').style.strokeDashoffset = '314';
    document.getElementById('scoreNumber').textContent = '0';
    document.getElementById('meterValue').textContent  = '0%';
    ['fPassion','fTrust','fChem','fBond'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.width = '0%';
    });
    ['tPassion','tTrust','tChem','tBond'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '0%';
    });

    setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.getElementById('name1').focus();
    }, 100);
}

/* ── Character limit ── */
['name1', 'name2'].forEach(id => {
    document.getElementById(id).addEventListener('input', function () {
        if (this.value.length > 50) this.value = this.value.slice(0, 50);
    });
});
