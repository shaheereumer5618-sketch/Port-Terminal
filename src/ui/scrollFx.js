// Scroll FX: combination-lock tick + scrollbar animation.
//
// Sound design — this is what makes it sound like a combination lock
// rather than a padlock or a mechanical keyboard:
//
//   1. Ultra-short high-frequency noise burst  →  the "tsk" of the detent
//   2. Short resonant sine "ting" at ~4.6 kHz   →  the metallic ring of the pin
//   3. Occasional faint bounce tick ~7 ms later →  the detent springing back
//
// No pitch slide, no low-end thud, no sustained body. Dry. Thin. Metallic.

let ctx = null;
let lastPlayed = 0;
const MIN_INTERVAL_MS = 75;
let scrollTimeout = null;

function ensureContext() {
    if (ctx) return ctx;

    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
        console.warn("[scrollFx] Web Audio API not supported.");
        return null;
    }

    try {
        ctx = new AC();
        console.log("[scrollFx] AudioContext created, state =", ctx.state);
    } catch (error) {
        console.warn("[scrollFx] Failed to create AudioContext:", error);
        return null;
    }

    return ctx;
}

function resumeContext() {
    if (!ctx) return Promise.resolve();
    if (ctx.state === "running") return Promise.resolve();
    return ctx.resume().then(() => {
        console.log("[scrollFx] AudioContext resumed, state =", ctx.state);
    }).catch(err => {
        console.warn("[scrollFx] resume() failed:", err);
    });
}

function playTick() {
    if (!ctx) return;

    if (ctx.state !== "running") {
        resumeContext().then(() => {
            if (ctx.state === "running") playTick();
        });
        return;
    }

    const now = ctx.currentTime;

    // Small random pitch/time variance so each tick is slightly
    // different — a real dial with imperfect machining.
    const pitch = 0.94 + Math.random() * 0.12;   // ±6%
    const t = now + Math.random() * 0.0015;      // up to 1.5 ms

    // --------------------------------------------------------------
    // 1. Dry metallic noise burst — the detent "tsk".
    //    16 ms total, band-passed at ~4.2 kHz. No body below 1 kHz.
    // --------------------------------------------------------------
    const dur = 0.016;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);

    for (let i = 0; i < len; i++) {
        const k = i / len;
        // Very steep decay (power 5) — no tail, dry.
        const decay = Math.pow(1 - k, 5);
        data[i] = (Math.random() * 2 - 1) * decay;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buf;

    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 4200 * pitch;
    bp.Q.value = 4;

    const shelf = ctx.createBiquadFilter();
    shelf.type = "highshelf";
    shelf.frequency.value = 6000;
    shelf.gain.value = 6;   // extra "air" / metal hiss

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.0001, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.14, t + 0.0008);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    noise.connect(bp).connect(shelf).connect(noiseGain).connect(ctx.destination);
    noise.start(t);
    noise.stop(t + dur + 0.005);

    // --------------------------------------------------------------
    // 2. Resonant "ting" — the metallic ring of the pin.
    //    Sine at ~4.6 kHz decaying in 22 ms. This is the pitch the
    //    ear locks onto as "combination lock".
    // --------------------------------------------------------------
    const ring = ctx.createOscillator();
    ring.type = "sine";
    ring.frequency.setValueAtTime(4600 * pitch, t);

    const ringGain = ctx.createGain();
    ringGain.gain.setValueAtTime(0.0001, t);
    ringGain.gain.exponentialRampToValueAtTime(0.11, t + 0.0008);
    ringGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

    ring.connect(ringGain).connect(ctx.destination);
    ring.start(t);
    ring.stop(t + 0.025);

    // --------------------------------------------------------------
    // 3. Faint bounce tick ~7 ms later.
    //    Only ~35% of ticks get it, so the rhythm sounds natural
    //    rather than mechanical/looped.
    // --------------------------------------------------------------
    if (Math.random() < 0.35) {
        const bounce = ctx.createOscillator();
        bounce.type = "triangle";
        bounce.frequency.setValueAtTime(3800 * pitch, t + 0.007);

        const bounceGain = ctx.createGain();
        bounceGain.gain.setValueAtTime(0.0001, t);
        bounceGain.gain.setValueAtTime(0.0001, t + 0.007);
        bounceGain.gain.exponentialRampToValueAtTime(0.045, t + 0.0075);
        bounceGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

        bounce.connect(bounceGain).connect(ctx.destination);
        bounce.start(t + 0.007);
        bounce.stop(t + 0.018);
    }
}

function onScroll() {
    // Visual state — 250 ms after the last scroll, remove the class.
    document.body.classList.add("is-scrolling");
    if (scrollTimeout !== null) {
        clearTimeout(scrollTimeout);
    }
    scrollTimeout = window.setTimeout(() => {
        document.body.classList.remove("is-scrolling");
        scrollTimeout = null;
    }, 250);

    // Audio, throttled.
    const now = performance.now();
    if (now - lastPlayed < MIN_INTERVAL_MS) return;
    lastPlayed = now;
    playTick();
}

export function setupScrollFx() {
    const unlockEvents = ["pointerdown", "keydown", "wheel", "touchstart", "click"];
    const unlock = () => {
        const c = ensureContext();
        if (c) resumeContext();
        for (const ev of unlockEvents) {
            document.removeEventListener(ev, unlock, true);
        }
    };
    for (const ev of unlockEvents) {
        document.addEventListener(ev, unlock, true);
    }

    window.addEventListener("scroll", onScroll, {
        passive: true,
        capture: true
    });

    // Manual test hook, callable from the browser Console.
    window.__scrollSoundTest = () => {
        const c = ensureContext();
        if (!c) {
            console.warn("[scrollFx] No AudioContext — audio unsupported.");
            return;
        }
        resumeContext().then(() => {
            playTick();
            console.log("[scrollFx] Test tick played.");
        });
    };

    // Fire three ticks in a row so you can hear the rhythm.
    window.__scrollSoundRhythm = () => {
        const c = ensureContext();
        if (!c) return;
        resumeContext().then(() => {
            playTick();
            setTimeout(playTick, 90);
            setTimeout(playTick, 180);
            console.log("[scrollFx] Three-tick rhythm played.");
        });
    };

    console.log(
        "[scrollFx] Ready. Scroll to hear combination-lock ticks. " +
        "Console: __scrollSoundTest() or __scrollSoundRhythm()."
    );
}