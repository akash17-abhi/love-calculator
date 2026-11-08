/* ═══════════════════════════════════════
   LOVE CALCULATOR — script.js
   Full Feature Suite:
   - Floating hearts & particle stars
   - Cursor heart trail & 3D tilt
   - Theme switcher (Rose, Lavender, Amber)
   - Web Audio synthesizer (Heartbeat & Chime)
   - Live Zodiac badge calculation
   - Famous couples presets
   - Cosmic Superpower & Advice generator
   - Downloadable Love Polaroid Card (html2canvas)
   - Native Share & Clipboard Copy
═══════════════════════════════════════ */

/* ── Global Audio State ── */
let soundEnabled = true;
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

/* ── Web Audio Synthesizer ── */
function playClickSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.06);
    } catch (_) {}
}

let heartbeatInterval = null;
function startHeartbeatSound() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const playBeat = () => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(65, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.12);
            gain.gain.setValueAtTime(0.18, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        };
        playBeat();
        setTimeout(playBeat, 240);
        heartbeatInterval = setInterval(() => {
            playBeat();
            setTimeout(playBeat, 240);
        }, 850);
    } catch (_) {}
}

function stopHeartbeatSound() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

function playCelebrationChime() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.50]; // C5, E5, G5, B5, C6
        notes.forEach((freq, idx) => {
            const startTime = ctx.currentTime + idx * 0.08;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.6);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.6);
        });
    } catch (_) {}
}

/* ══════════════════════════════════════
   INITIALIZATION
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
    generateParticles();
    initFloatingHearts();
    setMaxDate();
    injectSvgDefs();
    initThemeSwitcher();
    initSoundToggle();
    initLiveZodiac();
    initFamousPresets();

    // Desktop effects
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
    if (pct >= 75)      defs.innerHTML = buildGradientDef('#f43f5e', '#f472b6', '#e11d48');
    else if (pct >= 55) defs.innerHTML = buildGradientDef('#f97316', '#fbbf24', '#ea580c');
    else if (pct >= 35) defs.innerHTML = buildGradientDef('#8b5cf6', '#a78bfa', '#7c3aed');
    else                defs.innerHTML = buildGradientDef('#3b82f6', '#60a5fa', '#2563eb');
}

/* ── Max date ── */
function setMaxDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date1').max = today;
    document.getElementById('date2').max = today;
}

/* ══════════════════════════════════════
   THEME SWITCHER
══════════════════════════════════════ */
function initThemeSwitcher() {
    const btns = document.querySelectorAll('.theme-btn');
    const saved = localStorage.getItem('love_calc_theme') || 'theme-rose';
    setTheme(saved);

    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            playClickSound();
        });
    });
}

function setTheme(theme) {
    document.body.className = theme;
    document.querySelectorAll('.theme-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.theme === theme);
    });
    localStorage.setItem('love_calc_theme', theme);
}

/* ══════════════════════════════════════
   SOUND TOGGLE
══════════════════════════════════════ */
function initSoundToggle() {
    const toggle = document.getElementById('soundToggle');
    const icon = document.getElementById('soundIcon');
    const saved = localStorage.getItem('love_calc_sound');
    if (saved !== null) soundEnabled = saved === 'true';

    updateSoundUI();

    toggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        localStorage.setItem('love_calc_sound', soundEnabled);
        updateSoundUI();
        if (soundEnabled) playClickSound();
    });

    function updateSoundUI() {
        icon.textContent = soundEnabled ? '🔊' : '🔇';
        toggle.title = soundEnabled ? 'Mute Sound' : 'Enable Sound';
    }
}

/* ══════════════════════════════════════
   LIVE ZODIAC CALCULATION
══════════════════════════════════════ */
const ZODIAC_DATA = [
    { name: 'Capricorn', sym: '♑', elem: 'Earth 🌍', m: 1,  d: 19 },
    { name: 'Aquarius',  sym: '♒', elem: 'Air 💨',   m: 2,  d: 18 },
    { name: 'Pisces',    sym: '♓', elem: 'Water 💧', m: 3,  d: 20 },
    { name: 'Aries',     sym: '♈', elem: 'Fire 🔥',  m: 4,  d: 19 },
    { name: 'Taurus',    sym: '♉', elem: 'Earth 🌍', m: 5,  d: 20 },
    { name: 'Gemini',    sym: '♊', elem: 'Air 💨',   m: 6,  d: 20 },
    { name: 'Cancer',    sym: '♋', elem: 'Water 💧', m: 7,  d: 22 },
    { name: 'Leo',       sym: '♌', elem: 'Fire 🔥',  m: 8,  d: 22 },
    { name: 'Virgo',     sym: '♍', elem: 'Earth 🌍', m: 9,  d: 22 },
    { name: 'Libra',     sym: '♎', elem: 'Air 💨',   m: 10, d: 22 },
    { name: 'Scorpio',   sym: '♏', elem: 'Water 💧', m: 11, d: 21 },
    { name: 'Sagittarius',sym:'♐', elem: 'Fire 🔥',  m: 12, d: 21 },
    { name: 'Capricorn', sym: '♑', elem: 'Earth 🌍', m: 12, d: 31 }
];

function getZodiacInfo(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const m = parseInt(parts[1], 10);
    const d = parseInt(parts[2], 10);
    for (const z of ZODIAC_DATA) {
        if (m === z.m && d <= z.d) return z;
    }
    return ZODIAC_DATA[0];
}

function initLiveZodiac() {
    const bindLive = (dateInputId, badgeId) => {
        const input = document.getElementById(dateInputId);
        const badge = document.getElementById(badgeId);
        const update = () => {
            const z = getZodiacInfo(input.value);
            if (z) {
                badge.innerHTML = `<span class="zod-pill">${z.sym} ${z.name} • ${z.elem}</span>`;
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
                badge.innerHTML = '';
            }
        };
        input.addEventListener('change', update);
        input.addEventListener('input', update);
    };
    bindLive('date1', 'liveZodiac1');
    bindLive('date2', 'liveZodiac2');
}

/* ══════════════════════════════════════
   FAMOUS COUPLES PRESET CHIPS
══════════════════════════════════════ */
const FAMOUS_COUPLES = {
    'romeo-juliet': {
        name1: 'Romeo Montague', date1: '1998-04-14',
        name2: 'Juliet Capulet',  date2: '2000-07-26'
    },
    'jack-rose': {
        name1: 'Jack Dawson',     date1: '1995-05-18',
        name2: 'Rose DeWitt',     date2: '1997-10-05'
    },
    'barbie-ken': {
        name1: 'Barbie Roberts',  date1: '1999-03-09',
        name2: 'Ken Carson',      date2: '1998-03-11'
    }
};

function initFamousPresets() {
    document.querySelectorAll('.preset-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const key = chip.dataset.couple;
            const data = FAMOUS_COUPLES[key];
            if (!data) return;

            document.getElementById('name1').value = data.name1;
            document.getElementById('date1').value = data.date1;
            document.getElementById('name2').value = data.name2;
            document.getElementById('date2').value = data.date2;

            document.getElementById('date1').dispatchEvent(new Event('change'));
            document.getElementById('date2').dispatchEvent(new Event('change'));

            playClickSound();
            showToast(`Loaded ${chip.textContent.trim()}! 💕`);
        });
    });
}

/* ══════════════════════════════════════
   BACKGROUND PARTICLES & HEARTS
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
    startHeartbeatSound();

    fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name1, date1, name2, date2 })
    })
    .then(res => { if (!res.ok) throw new Error(); return res.json(); })
    .then(data => {
        stopHeartbeatSound();
        hideLoading();
        displayResults(data, name1, name2, date1, date2);
        playCelebrationChime();
    })
    .catch(() => {
        stopHeartbeatSound();
        hideLoading();
        showToast('Something went wrong. Please try again.');
    });
}

/* ══════════════════════════════════════
   DISPLAY RESULTS
══════════════════════════════════════ */
function displayResults(data, name1, name2, date1, date2) {
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

    // Animate score ring + counter
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

    // Traits breakdown
    const traits = calculateTraits(name1, name2, target);
    setTimeout(() => animateTraits(traits), 700);

    // Cosmic Advice & Superpower
    generateCosmicAdvice(name1, name2, date1, date2, target);

    // Confetti burst
    setTimeout(launchConfetti, 400);

    // Smooth scroll
    setTimeout(() => {
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

/* ══════════════════════════════════════
   COSMIC SUPERPOWER & ADVICE
══════════════════════════════════════ */
function generateCosmicAdvice(name1, name2, date1, date2, lovePct) {
    const z1 = getZodiacInfo(date1);
    const z2 = getZodiacInfo(date2);

    const superpowers = [
        "Telepathic understanding & playful banter that lights up any room.",
        "Unshakeable emotional grounding paired with endless adventurous spark.",
        "Deep intuitive empathy—you both know what the other feels before a word is spoken.",
        "Dynamic passion and complementary strengths that overcome any hurdle.",
        "Pure harmony and gentle patience, making ordinary days feel magical."
    ];

    const advices = [
        "Keep scheduling spontaneous date nights to keep your natural magnetic spark shining bright.",
        "Never hesitate to speak your feelings freely—your bond thrives most on mutual vulnerability.",
        "Celebrate each other's quiet milestones; your shared encouragement is your greatest strength.",
        "Give each other room to dream individually while building your shared empire of memories.",
        "Laugh together through life's unexpected turns—your humor is your relationship's superpower."
    ];

    // Days difference calculation
    let daysDiffText = "In cosmic synchronization";
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (!isNaN(diffDays)) {
            daysDiffText = `Born ${diffDays.toLocaleString()} days apart • Balanced Planetary Resonance`;
        }
    } catch (_) {}

    const seed = (lovePct + (z1 ? z1.m : 1) + (z2 ? z2.m : 2)) % superpowers.length;
    document.getElementById('superpowerText').textContent = superpowers[seed];
    document.getElementById('secretAdviceText').textContent = advices[seed];
    document.getElementById('cosmicSyncPill').textContent = `🪐 ${daysDiffText}`;
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
   POLAROID CERTIFICATE DOWNLOAD
══════════════════════════════════════ */
function downloadLoveCertificate() {
    if (typeof html2canvas === 'undefined') {
        showToast('Capture tool loading, please try again in a second.');
        return;
    }

    const name1 = document.getElementById('rName1').textContent || 'You';
    const name2 = document.getElementById('rName2').textContent || 'Beloved';
    const score = document.getElementById('scoreNumber').textContent || '0';
    const zod1  = document.getElementById('zodiac1').textContent;
    const zod2  = document.getElementById('zodiac2').textContent;
    const quote = document.getElementById('quoteText').textContent;

    // Populate the hidden export card
    document.getElementById('polName1').textContent = name1;
    document.getElementById('polName2').textContent = name2;
    document.getElementById('polScore').textContent = `${score}%`;
    document.getElementById('polZod1').textContent  = zod1;
    document.getElementById('polZod2').textContent  = zod2;
    document.getElementById('polQuote').textContent = quote;
    document.getElementById('polDate').textContent  = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });

    const exportCard = document.getElementById('polaroidExportCard');
    const btn = document.getElementById('downloadBtn');
    const prevText = btn.innerHTML;
    btn.innerHTML = '⏳ Generating...';
    btn.disabled = true;

    html2canvas(exportCard, {
        scale: 2,
        backgroundColor: '#0d0a14',
        useCORS: true
    }).then(canvas => {
        const link = document.createElement('a');
        link.download = `Love-Certificate-${name1}-${name2}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        btn.innerHTML = prevText;
        btn.disabled = false;
        showToast('Polaroid Card downloaded! 📸✨');
    }).catch(err => {
        console.error(err);
        btn.innerHTML = prevText;
        btn.disabled = false;
        showToast('Failed to generate image. Please try again.');
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
    document.getElementById('liveZodiac1').classList.remove('visible');
    document.getElementById('liveZodiac2').classList.remove('visible');

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
