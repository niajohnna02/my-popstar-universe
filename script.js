/* ✦ My Popstar Universe — welcome screen script ✦
   Part 1: shimmery star cursor trail
   Part 2: Enter button
*/

/* =========================================================
   PART 1: STAR CURSOR TRAIL
   ========================================================= */

const canvas = document.getElementById("sparkle-canvas");
const ctx = canvas.getContext("2d");

// Sparkle colors: pink, hot pink, lilac, white, silver
const COLORS = ["#ffc9e4", "#ff8cc6", "#d9b8e8", "#ffffff", "#e6e6ec"];

// Respect people who've turned off animations on their device
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let particles = []; // every sparkle currently on screen
let mouse = { x: -100, y: -100, lastX: -100, lastY: -100, visible: false };

// Size the canvas to the window (and keep it sharp on retina screens)
function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Small helpers
const random = (min, max) => Math.random() * (max - min) + min;
const pick = (list) => list[Math.floor(Math.random() * list.length)];

// Make one sparkle. "burst" sparkles (from clicks) fly out faster and bigger.
function createParticle(x, y, burst = false) {
    const angle = random(0, Math.PI * 2);
    const speed = burst ? random(2, 6) : random(0.2, 1.2);

    return {
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,                       // sideways speed
        vy: Math.sin(angle) * speed + (burst ? 0 : 0.4),   // trail sparkles drift down like glitter
        size: burst ? random(5, 11) : random(3, 9),        // ✦ change sparkle size here
        color: pick(COLORS),
        shape: Math.random() < 0.65 ? "sparkle" : "dot",   // mostly ✦, some •
        life: 1,                                           // 1 = fully visible, 0 = gone
        decay: random(0.012, 0.025),                       // ✦ smaller = longer trail
        rotation: random(0, Math.PI),
        spin: random(-0.05, 0.05),
    };
}

// Draw a 4-point sparkle ✦
function drawSparkle(p) {
    const s = p.size * p.life; // shrinks as it fades
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation);
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(s * 0.12, -s * 0.12, s, 0);
    ctx.quadraticCurveTo(s * 0.12, s * 0.12, 0, s);
    ctx.quadraticCurveTo(-s * 0.12, s * 0.12, -s, 0);
    ctx.quadraticCurveTo(-s * 0.12, -s * 0.12, 0, -s);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

// Draw a tiny round dot •
function drawDot(p) {
    ctx.beginPath();
    ctx.arc(p.x, p.y, (p.size / 3) * p.life, 0, Math.PI * 2);
    ctx.fill();
}

// The glowing white star that sits right on the cursor
function drawCursorStar() {
    if (!mouse.visible) return;
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#ff8cc6";
    ctx.shadowBlur = 16;
    drawSparkle({ x: mouse.x, y: mouse.y, size: 10, life: 1, rotation: 0 });
    ctx.restore();
}

// Runs about 60 times a second: move, fade and redraw every sparkle
function animate() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // loop backwards so we can safely remove faded sparkles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;   // slow down a little each frame
        p.vy *= 0.97;
        p.vy += 0.02;   // gentle gravity
        p.rotation += p.spin;
        p.life -= p.decay;

        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;  // the glow

        if (p.shape === "sparkle") {
            drawSparkle(p);
        } else {
            drawDot(p);
        }
    }

    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    drawCursorStar();

    requestAnimationFrame(animate);
}

// When the cursor moves: slow = a few twinkles, fast = a glittery burst
function handleMove(x, y) {
    mouse.visible = true;
    mouse.lastX = mouse.x;
    mouse.lastY = mouse.y;
    mouse.x = x;
    mouse.y = y;

    if (reduceMotion) return;

    const speed = Math.hypot(mouse.x - mouse.lastX, mouse.y - mouse.lastY);
    const count = Math.min(1 + Math.floor(speed / 8), 6);

    for (let i = 0; i < count; i++) {
        particles.push(createParticle(x + random(-4, 4), y + random(-4, 4)));
    }

    // cap the number of sparkles so it stays smooth on slower devices
    if (particles.length > 400) {
        particles.splice(0, particles.length - 400);
    }
}

// A ring of sparkles that pops out on click / tap
function starburst(x, y) {
    if (reduceMotion) return;
    for (let i = 0; i < 28; i++) {
        particles.push(createParticle(x, y, true));
    }
}

// Mouse
window.addEventListener("mousemove", (e) => handleMove(e.clientX, e.clientY));
window.addEventListener("mouseleave", () => (mouse.visible = false));
window.addEventListener("click", (e) => starburst(e.clientX, e.clientY));

// Touch (phones): the trail follows your finger
window.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
    starburst(t.clientX, t.clientY);
}, { passive: true });

window.addEventListener("touchmove", (e) => {
    const t = e.touches[0];
    handleMove(t.clientX, t.clientY);
}, { passive: true });

window.addEventListener("touchend", () => (mouse.visible = false));

animate(); // start the loop

/* =========================================================
   PART 2: ENTER BUTTON
   ========================================================= */

const welcome = document.getElementById("welcome");
const hub = document.getElementById("hub");
const enterBtn = document.getElementById("enter-btn");
const backBtn = document.getElementById("back-btn");

//shows one screen and hides the others
function showScreen(id) {
    document.querySelectorAll(".screen").forEach((screen) => {
        screen.classList.remove("is-active");
    });

    document.getElementById(id).classList.add("is-active");
}

enterBtn.addEventListener("click", () => {
    // zoom into the stars + fade out (the styles are in styles.css, section 4)
    welcome.classList.add("is-leaving");

    // For now, the welcome screen comes back after the zoom so you can test it again.
    // When the hub is built, replace this with code that shows the hub.
    setTimeout(() => {
        // welcome.classList.remove("is-active");
        // hub.classList.add("is-active");
        showScreen("hub");
    }, 700);
});

backBtn.addEventListener("click", () => {
    // hub.classList.remove("is-active");
    welcome.classList.remove("is-leaving");
    // welcome.classList.add("is-active");
    showScreen("welcome");
});

/* =========================================================
   PART 3: FEATURE STARS
   ========================================================= */

const stars = document.querySelectorAll(".feature-star");
const starMap = document.querySelector(".star-map");

stars.forEach((star) => {
    star.addEventListener("click", () => {
        const feature = star.dataset.feature;

        star.classList.add("is-picked");
        starMap.classList.add("has-picked");

        //just log the feature for now until the feature pages are built
        console.log("Opening: " + feature);

        setTimeout(() => {
            star.classList.remove("is-picked");
            starMap.classList.remove("has-picked");
            showScreen(feature);
            if (feature === "popstar") {
                startCamera();
            }
        }, 800);
    });
});

/* =========================================================
   PART 4: BACK TO THE HUB
   ========================================================= */

document.querySelectorAll(".back-to-hub").forEach((button) => {
    button.addEventListener("click", () => {
        stopBreathing();
        stopMeter();
        stopPillowGame();
        stopCamera();
        showScreen("hub");
    });
});

/* =========================================================
   PART 5: BREATHING CLOUD
   ========================================================= */

const breathCloud = document.getElementById("breath-cloud");
const breathLabel = document.getElementById("breath-label");
const breathSub = document.getElementById("breath-sub");
const breathBtn = document.getElementById("breath-btn");
const ladderSteps = document.querySelectorAll(".ladder-step");
const cloudLadder = document.getElementById("cloud-ladder");
const modeBtns = document.querySelectorAll(".mode-btn");

let isBreathing = false;
let breathCount = 0;
let breathTimer;
let mode = "nine";

function startBreathing() {
    isBreathing = true;
    breathCount = 0;
    ladderSteps.forEach((step) => step.classList.remove("is-filled"));
    breathBtn.textContent = "stop";
    breatheIn();
}

function stopBreathing() {
    isBreathing = false;
    clearTimeout(breathTimer);
    breathCloud.classList.remove("is-big", "is-glowing");
    breathLabel.textContent = "ready when you are";
    breathBtn.textContent = "start breathing ✦";

    if (mode === "nine") {
        breathSub.textContent = "9 slow breaths to float up to cloud 9";
        cloudLadder.classList.remove("is-hidden");
    } else {
        breathSub.textContent = "breathe along with the cloud for as long as you like";
        cloudLadder.classList.add("is-hidden");
    }
}

breathBtn.addEventListener("click", () => {
    if (isBreathing) {
        stopBreathing();
    } else {
        startBreathing();
    }
});

modeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        modeBtns.forEach((otherBtn) => {
            otherBtn.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");

        mode = btn.dataset.mode;
        stopBreathing();
    });
});

function breatheIn() {
    breathCloud.classList.add("is-big");
    breathLabel.textContent = "breathe in";
    if (mode === "nine") {
        breathSub.textContent = "☁️ cloud " + (breathCount + 1) + " of 9";
    } else {
        breathSub.textContent = "breath " + (breathCount + 1);
    }
    breathTimer = setTimeout(hold, 4000);
}

function hold() {
    breathCloud.classList.add("is-glowing");
    breathLabel.textContent = "hold";
    breathTimer = setTimeout(breatheOut, 4000);
}

function breatheOut() {
    breathCloud.classList.remove("is-big");
    breathCloud.classList.remove("is-glowing");
    breathLabel.textContent = "breathe out";
    breathTimer = setTimeout(finishBreath, 4000);
}

function finishBreath() {
    if (mode === "nine") {
        ladderSteps[breathCount].classList.add("is-filled");
    }

    breathCount = breathCount + 1;

    if (mode === "nine" && breathCount === 9) {
        reachCloud9();
    } else {
        breatheIn();
    }
}

function reachCloud9() {
    isBreathing = false;
    breathLabel.textContent = "you're on cloud 9!";
    breathSub.textContent = "☁️time to celebrate!";
    breathBtn.textContent = "breathe again ✦";
}

/* =========================================================
   PART 6: DON'T CRASH OUT
   ========================================================= */

// find the elements
const meter = document.getElementById("meter");
const meterStar = document.getElementById("meter-star");
const meterZone = document.getElementById("meter-zone");
const calmBtn = document.getElementById("calm-btn");
const crashRound = document.getElementById("crash-round");
const crashCracks = document.getElementById("crash-cracks");
const crashMessage = document.getElementById("crash-message");

// things to remember
let isPlaying = false;
let starPos = 0;  // where the star is: 0 (left end) to 100 (right end)
let starDir = 1;  // which way it's going: 1 = right, -1 = left
let starSpeed = 1.2;  // how far it moves each step
let meterTimer;

let round = 1;
let cracks = 0;
let zoneLeft = 35;  // the left position of the zone in percentage
let zoneWidth = 30;  // the width of the zone in percentage

// move the star one tiny step
function moveStar() {
    starPos = starPos + starSpeed * starDir;

    if (starPos >= 100) {
        starPos = 100;
        starDir = -1;
    }

    if (starPos <= 0) {
        starPos = 0;
        starDir = 1;
    }

    meterStar.style.left = starPos + "%";
}

// start and stop
function startMeter() {
    isPlaying = true;
    calmBtn.textContent = "stay calm ✦";
    meterTimer = setInterval(moveStar, 20);
}

function stopMeter() {
    isPlaying = false;
    clearInterval(meterTimer);
    calmBtn.textContent = "start ✦";
}

// update what's on screen
function updateStats() {
    crashRound.textContent = "round " + round + " / 8";
    crashCracks.textContent = "cracks " + cracks + " / 3";
}

function updateZone() {
    meterZone.style.left = zoneLeft + "%";
    meterZone.style.width = zoneWidth + "%";
}

// start a new game
function startGame() {
    round = 1;
    cracks = 0;
    starPos = 0;
    starDir = 1;
    starSpeed = 1.2;
    zoneLeft = 35;
    zoneWidth = 30;

    updateStats();
    updateZone();
    crashMessage.textContent = "tap when the star is in the pink zone";
    startMeter();
}

// checking tap (did you stay calm?)
function checkTap() {
    if (starPos >= zoneLeft && starPos <= zoneLeft + zoneWidth) {
        hit();
    } else {
        miss();
    }
}

function hit() {
    if (round === 8) {
        stayedIconic();
    } else {
        round = round + 1;
        starSpeed = starSpeed + 0.4;
        zoneWidth = zoneWidth - 3;
        zoneLeft = Math.random() * (100 - zoneWidth);

        crashMessage.textContent = "unbothered ✦";
        updateStats();
        updateZone();
    }
}

function miss() {
    cracks = cracks + 1;
    updateStats();
    crashMessage.textContent = "ugh 😤";

    meter.classList.add("is-shaking");
    setTimeout(() => {
        meter.classList.remove("is-shaking");
    }, 400);

    if (cracks === 3) {
        crashedOut();
    }
}

// two endings
function crashedOut() {
    stopMeter();
    crashMessage.textContent = "you crashed out 💥";
    calmBtn.textContent = "try again ✦";
}

function stayedIconic() {
    stopMeter();
    crashMessage.textContent = "you stayed iconic ✦";
    calmBtn.textContent = "play again ✦";
}

// the button
calmBtn.addEventListener("click", () => {
    if (isPlaying) {
        checkTap();
    } else {
        startGame();
    }
});

/* =========================================================
   PART 7: LET'S HAVE A PILLOW FIGHT
   ========================================================= */

// --- 1. find the elements ---
const orderSlots = document.querySelectorAll(".order-slot");
const itemBtns = document.querySelectorAll(".item-btn");
const pillowMessage = document.getElementById("pillow-message");
const pillowBtn = document.getElementById("pillow-btn");
const swingBar = document.getElementById("swing-bar");
const swingFill = document.getElementById("swing-fill");
const swingPillow = document.getElementById("swing-pillow");
const pillowDodged = document.getElementById("pillow-dodged");
const pillowBops = document.getElementById("pillow-bops");

// --- 2. the items, and things to remember ---
const allItems = ["brown-bear", "pink-eyemask", "popcorn"];

let order = [];
let orderStep = 0;

let pillowPlaying = false;   // is a game going on?
let canTap = false;          // is a round active right now?
let dodged = 0;
let bops = 0;

let swingAmount = 0;         // how full the bar is: 0 to 100
let swingTime = 5000;        // how long the bar takes to fill (ms)
let swingTimer;              // the repeating timer that fills the bar
let roundTimer;              // the short wait between rounds

// --- 3. update the counters ---
function updatePillowStats() {
    pillowDodged.textContent = "dodged " + dodged;
    pillowBops.textContent = "bops " + bops + " / 3";
}

// --- 4. picking random items + starting a round ---
function randomItem() {
    const randomIndex = Math.floor(Math.random() * allItems.length);
    return allItems[randomIndex];
}

function newRound() {
    order = [randomItem(), randomItem(), randomItem()];
    orderStep = 0;

        orderSlots.forEach((slot, i) => {
            const img = slot.querySelector("img");
            img.src = "assets/" + order[i] + ".png";
            img.alt = order[i];
            slot.classList.remove("is-done");
    });

    swingPillow.style.transform = "rotate(-10deg)";

    swingAmount = 0;
    swingFill.style.width = "0%";
    canTap = true;
}

// --- 5. the swing bar fills up ---
function moveSwing() {
    if (canTap) {
        swingAmount = swingAmount + (50 / swingTime) * 100;
        swingFill.style.width = swingAmount + "%";
        
        swingPillow.style.transform = "rotate(" + (-10 - swingAmount * 0.3) + "deg)";

        if (swingAmount >= 100) {
            bop("too slow!");
        }
    }
}

// --- 6. tapping an item ---
function tapItem(item) {
    if (canTap) {
        if (item === order[orderStep]) {
            orderSlots[orderStep].classList.add("is-done");
            orderStep = orderStep + 1;

            if (orderStep === 3) {
                dodge();
            }
        } else {
            bop("wrong one!");
        }
    }
}

itemBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        tapItem(btn.dataset.item);
    });
});

// --- 7. dodge or bop ---
function dodge() {
    canTap = false;
    dodged = dodged + 1;
    updatePillowStats();
    pillowMessage.textContent = "dodged! 🪶";

    swingTime = swingTime - 350;
    if (swingTime < 2000) {
        swingTime = 2000;
    }

    roundTimer = setTimeout(newRound, 800);
}

function bop(reason) {
    canTap = false;
    swingPillow.style.transform = "rotate(-10deg)";
    bops = bops + 1;
    updatePillowStats();
    pillowMessage.textContent = reason + " BOP! 😆";

    swingBar.classList.add("is-shaking");
    setTimeout(() => {
        swingBar.classList.remove("is-shaking");
    }, 400);

    swingPillow.classList.add("is-bopping");
    setTimeout(() => {
        swingPillow.classList.remove("is-bopping");
    }, 600);

    if (bops === 3) {
        pillowGameOver();
    } else {
        roundTimer = setTimeout(newRound, 1000);
    }
}

// --- 8. start, stop, game over ---
function startPillowGame() {
    dodged = 0;
    bops = 0;
    swingTime = 5000;
    updatePillowStats();

    pillowPlaying = true;
    pillowBtn.textContent = "stop";
    pillowMessage.textContent = "go go go! 🪶";

    newRound();
    swingTimer = setInterval(moveSwing, 50);
}

function stopPillowGame() {
    pillowPlaying = false;
    canTap = false;
    clearInterval(swingTimer);
    clearTimeout(roundTimer);
    pillowBtn.textContent = "start ✦";
}

function pillowGameOver() {
    stopPillowGame();
    pillowMessage.textContent = "pillow fight over! you dodged " + dodged + " ✦";
    pillowBtn.textContent = "play again ✦";
}

pillowBtn.addEventListener("click", () => {
    if (pillowPlaying) {
        stopPillowGame();
        pillowMessage.textContent = "tap the items in order before she bops you!";
    } else {
        startPillowGame();
    }
});

/* =========================================================
   PART 8: MY POPSTAR
   ========================================================= */

// --- 1. find the elements ---
const boothSection = document.getElementById("popstar");
const boothMessage = document.getElementById("booth-message");
const cameraScreen = document.getElementById("camera-screen");
const boothVideo = document.getElementById("booth-video");
const boothPhoto = document.getElementById("booth-photo");
const countdown = document.getElementById("countdown");
const snapBtn = document.getElementById("snap-btn");
const retakeBtn = document.getElementById("retake-btn");

// --- 2. things to remember ---
let cameraStream = null;     // the live camera, once it's on
let stripPhotos = [];       // the 4 photos for the strip

// --- 3. turn the camera on and off ---
async function startCamera() {
    clearStickers();
    boothSection.classList.remove("is-snapped");

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        boothVideo.srcObject = cameraStream;
        boothMessage.textContent = "strike a pose ✦";
    } catch (error) {
        boothMessage.textContent = "the camera isn't available 🥺 check your camera permission";
        console.log(error);
    }
}

function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach((track) => {
            track.stop();
        });
        cameraStream = null;
    }
}

// pause for some milliseconds (use with await)
function wait(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

// --- 4. the countdown ---
function startCountdown() {
    if (cameraStream) {
        snapBtn.disabled = true;
        boothMessage.textContent = "say cheese! 📸";

        countdown.textContent = "3";
        setTimeout(() => { countdown.textContent = "2"; }, 1000);
        setTimeout(() => { countdown.textContent = "1"; }, 2000);
        setTimeout(takePhoto, 3000);
    }
}

// --- 5. taking photos ---

// the white flash
function flash() {
    cameraScreen.classList.add("is-flashing");
    setTimeout(() => {
        cameraScreen.classList.remove("is-flashing");
    }, 400);
}

// copy what the camera sees onto a NEW canvas, and give it back
function capturePhoto() {
    const w = boothVideo.videoWidth;
    const h = boothVideo.videoHeight;
    const size = Math.min(w, h);

    const shot = document.createElement("canvas");
    shot.width = size;
    shot.height = size;

    const shotCtx = shot.getContext("2d");
    shotCtx.translate(size, 0);
    shotCtx.scale(-1, 1);
    shotCtx.drawImage(boothVideo, (w - size) / 2, (h - size) / 2, size, size, 0, 0, size, size);

    return shot;
}

// the single polaroid
function takePhoto() {
    countdown.textContent = "";
    flash();

    const shot = capturePhoto();
    boothPhoto.width = shot.width;
    boothPhoto.height = shot.height;
    boothPhoto.getContext("2d").drawImage(shot, 0, 0);

    setTimeout(() => {
        boothSection.classList.add("is-snapped");
        boothMessage.textContent = "you're a star ✦ add some stickers!";
        snapBtn.disabled = false;
    }, 400);
}

// --- 6. the buttons ---
snapBtn.addEventListener("click", () => {
    if (boothFormat === "strip") {
        takeStrip();
    } else {
        startCountdown();
    }
});

retakeBtn.addEventListener("click", () => {
    clearStickers();
    resetShotDots();
    boothSection.classList.remove("is-snapped");
    boothMessage.textContent = "strike a pose ✦";
});

// --- format: polaroid or photo strip ---
const formatBtns = document.querySelectorAll(".format-btn");
let boothFormat = "polaroid";

formatBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        formatBtns.forEach((otherBtn) => {
            otherBtn.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");

        boothFormat = btn.dataset.format;
        resetShotDots();

        if (boothFormat === "strip") {
            boothSection.classList.add("is-strip-mode");
            boothMessage.textContent = "4 photos coming up… get your poses ready ✦";
        } else {
            boothSection.classList.remove("is-strip-mode");
            boothMessage.textContent = "strike a pose ✦";
        }
    });
});

// --- photo strip: 4 photos in a row ---
const shotDots = document.querySelectorAll(".shot-dot");

function resetShotDots() {
    shotDots.forEach((dot) => {
        dot.classList.remove("is-done");
    });
}

async function takeStrip() {
    snapBtn.disabled = true;
    stripPhotos = [];
    resetShotDots();

    for (let shot = 0; shot < 4; shot++) {
        boothMessage.textContent = "photo " + (shot + 1) + " of 4 ✦";

        countdown.textContent = "3";
        await wait(1000);
        countdown.textContent = "2";
        await wait(1000);
        countdown.textContent = "1";
        await wait(1000);
        countdown.textContent = "";

        // stop if the camera was turned off (they left the page)
        if (cameraStream === null) {
            snapBtn.disabled = false;
            return;
        }

        flash();
        stripPhotos.push(capturePhoto());
        shotDots[shot].classList.add("is-done");

        await wait(800);    // a moment to change your pose
    }

    snapBtn.disabled = false;
    printStrip();
}

// --- printing the strip ---
const photoStrip = document.getElementById("photo-strip");
const stripPhotosBox = document.getElementById("strip-photos");
const stripStyleBtns = document.querySelectorAll(".strip-style-btn");

function printStrip() {
    stripPhotosBox.replaceChildren();

    stripPhotos.forEach((photo) => {
        photo.classList.add("strip-photo");
        stripPhotosBox.appendChild(photo);
    });

    boothSection.classList.add("is-snapped");
    boothMessage.textContent = "printed! ✦ pick your strip style";
}

stripStyleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        stripStyleBtns.forEach((otherBtn) => {
            otherBtn.classList.remove("is-selected");
        });
        btn.classList.add("is-selected");

        photoStrip.classList.remove("strip-pink", "strip-black");
        photoStrip.classList.add("strip-" + btn.dataset.style);
    });
});

// --- 7. stickers ---
const photoArea = document.getElementById("photo-area");
const stickerBtns = document.querySelectorAll(".sticker-btn");
let draggedSticker = null;     // the sticker being dragged right now

// tap a sticker button → add that sticker to the photo
stickerBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        addSticker(btn.dataset.sticker);
    });
});

function addSticker(name) {
    const sticker = document.createElement("img");
    sticker.src = "assets/" + name + ".png";
    sticker.alt = "";
    sticker.draggable = false;
    sticker.classList.add("placed-sticker");
    sticker.style.left = "50%";
    sticker.style.top = "50%";

    let target = photoArea;
    if (boothFormat === "strip") {
        target = photoStrip;
    }
    target.appendChild(sticker);

    sticker.addEventListener("pointerdown", () => {
        draggedSticker = sticker;
        sticker.classList.add("is-dragging");
    });
}

// move the sticker you're dragging
window.addEventListener("pointermove", (event) => {
    if (draggedSticker) {
        const box = draggedSticker.parentElement.getBoundingClientRect();
        const x = ((event.clientX - box.left) / box.width) * 100;
        const y = ((event.clientY - box.top) / box.height) * 100;

        draggedSticker.style.left = x + "%";
        draggedSticker.style.top = y + "%";
    }
});

// let go → stop dragging
window.addEventListener("pointerup", () => {
    if (draggedSticker) {
        draggedSticker.classList.remove("is-dragging");
        draggedSticker = null;
    }
});

// remove every sticker from the photo
function clearStickers() {
    document.querySelectorAll(".placed-sticker").forEach((sticker) => {
        sticker.remove();
    });
}

// --- 8. save the polaroid ---
const saveBtn = document.getElementById("save-btn");
const polaroidCaption = document.querySelector(".polaroid-caption");

// download any canvas as a PNG file
function downloadCanvas(canvas, fileName) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();
    boothMessage.textContent = "saved! ✦ check your downloads 💾";
}

function savePolaroid() {
    // sizes for the saved image (in pixels)
    const pad = 40;            // white border on the top and sides
    const photoSize = 1000;    // the square photo
    const bottom = 160;        // the thick bottom edge for the caption

    // 1. make a new canvas the size of the whole polaroid
    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = photoSize + pad * 2;
    exportCanvas.height = pad + photoSize + bottom;
    const ex = exportCanvas.getContext("2d");

    // 2. paint the white frame
    ex.fillStyle = "#f7f4f6";
    ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // 3. paint the photo
    ex.drawImage(boothPhoto, pad, pad, photoSize, photoSize);

    // 4. paint each sticker (only inside the photo, like on screen)
    ex.save();
    ex.beginPath();
    ex.rect(pad, pad, photoSize, photoSize);
    ex.clip();

    photoArea.querySelectorAll(".placed-sticker").forEach((sticker) => {
        const x = pad + (parseFloat(sticker.style.left) / 100) * photoSize;
        const y = pad + (parseFloat(sticker.style.top) / 100) * photoSize;
        const w = photoSize * 0.28;
        const h = w * (sticker.naturalHeight / sticker.naturalWidth);

        ex.drawImage(sticker, x - w / 2, y - h / 2, w, h);
    });

    ex.restore();

    // 5. write the caption
    ex.fillStyle = "#2a2730";
    ex.font = "48px Unbounded";
    ex.textAlign = "center";
    ex.fillText(polaroidCaption.textContent, exportCanvas.width / 2, pad + photoSize + 100);

    // 6. download it!
    downloadCanvas(exportCanvas, "my-popstar-polaroid.png");
}

// --- save the photo strip ---
const stripCaption = document.querySelector(".strip-caption");
const stripHeader = document.querySelector(".strip-header");

function saveStrip() {
    // 1. measure the strip, and decide how much bigger to save it
    const stripBox = photoStrip.getBoundingClientRect();
    const scale = 600 / stripBox.width;          // saved strip is 600px wide

    const exportCanvas = document.createElement("canvas");
    exportCanvas.width = stripBox.width * scale;
    exportCanvas.height = stripBox.height * scale;
    const ex = exportCanvas.getContext("2d");

    const isBlack = photoStrip.classList.contains("strip-black");

    // helper: where is this element, in saved-image pixels?
    function place(element) {
        const box = element.getBoundingClientRect();
        return {
            x: (box.left - stripBox.left) * scale,
            y: (box.top - stripBox.top) * scale,
            w: box.width * scale,
            h: box.height * scale
        };
    }

    // 2. the background
    if (isBlack) {
        ex.fillStyle = "#121014";
        ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // silver film dots down the left side
        ex.fillStyle = "#b9b6c2";
        for (let y = 60; y < stripBox.height - 40; y += 40) {
            ex.beginPath();
            ex.arc(6 * scale, y * scale, 2 * scale, 0, Math.PI * 2);
            ex.fill();
        }
    } else {
        ex.fillStyle = "#ffd9ec";
        ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

        // black polka dots
        ex.fillStyle = "#070407";
        const gap = 16 * scale;
        for (let y = gap / 2; y < exportCanvas.height; y += gap) {
            for (let x = gap / 2; x < exportCanvas.width; x += gap) {
                ex.beginPath();
                ex.arc(x, y, 1.8 * scale, 0, Math.PI * 2);
                ex.fill();
            }
        }
    }

    // 3. the photos
    stripPhotosBox.querySelectorAll(".strip-photo").forEach((photo) => {
        const p = place(photo);

        if (isBlack) {
            ex.drawImage(photo, p.x, p.y, p.w, p.h);
        } else {
            const border = 3 * scale;
            ex.fillStyle = "#ffffff";
            ex.fillRect(p.x, p.y, p.w, p.h);
            ex.drawImage(photo, p.x + border, p.y + border, p.w - border * 2, p.h - border * 2);
        }
    });

    // 4. the caption (and the header, for black film)
    ex.textAlign = "center";
    ex.textBaseline = "middle";

    const cap = place(stripCaption);
    if (isBlack) {
        ex.fillStyle = "#e6e6ec";
    } else {
        ex.fillStyle = "#ffd9ec";
        ex.fillRect(cap.x, cap.y, cap.w, cap.h);
        ex.fillStyle = "#070407";
    }
    ex.font = 22 * scale + "px 'Pinyon Script'";
    ex.fillText(stripCaption.textContent, cap.x + cap.w / 2, cap.y + cap.h / 2);

    if (isBlack) {
        const head = place(stripHeader);
        ex.fillStyle = "#e6e6ec";
        ex.font = 16 * scale + "px 'Pinyon Script'";
        ex.fillText("✦ popstar ✦", head.x + head.w / 2, head.y + head.h / 2);
    }

    // 5. the stickers
    photoStrip.querySelectorAll(".placed-sticker").forEach((sticker) => {
        const s = place(sticker);
        ex.drawImage(sticker, s.x, s.y, s.w, s.h);
    });

    // 6. download!
    downloadCanvas(exportCanvas, "my-popstar-strip.png");
}

saveBtn.addEventListener("click", () => {
    if (boothFormat === "strip") {
        saveStrip();
    } else {
        savePolaroid();
    }
});

/* =========================================================
   PART 9: STARRY NIGHT SKY
   ========================================================= */

function fillNightSky(sky, count) {
    for (let i = 0; i < count; i++) {
        const star = document.createElement("span");
        star.classList.add("sky-star");

        const size = 1 + Math.random() * 3;
        star.style.width = size + "px";
        star.style.height = size + "px";

        star.style.left = Math.random() * 100 + "%";
        star.style.top = Math.random() * 100 + "%";

        star.style.animationDuration = 2 + Math.random() * 4 + "s";
        star.style.animationDelay = Math.random() * 5 + "s";

        if (Math.random() < 0.25) {
            star.classList.add("is-pink");
        }

        sky.appendChild(star);
    }
}

document.querySelectorAll(".night-sky").forEach((sky) => {
    fillNightSky(sky, 90);
});