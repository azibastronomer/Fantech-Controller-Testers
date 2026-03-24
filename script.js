const FANTECH_MODELS = {
    "0e10": { 
        name: "SHOOTER GP13", 
        img: "https://fantechworld.com/wp-content/uploads/2021/04/shooter-gp13-1.png",
        layout: ["A", "B", "X", "Y", "LB", "RB", "LT", "RT", "SELECT", "START", "L3", "R3", "HOME", "TURBO"]
    },
    "wgp14": { 
        name: "NOVA WGP14", 
        img: "https://fantech.ph/wp-content/uploads/2023/10/WGP14-BLK-1.png",
        layout: ["CROSS", "CIRCLE", "SQUARE", "TRIANGLE", "L1", "R1", "L2", "R2", "SHARE", "OPTIONS", "L3", "R3", "HOME", "TOUCHPAD"]
    },
    "default": { name: "GENERIC CONTROLLER", img: "https://fantechworld.com/wp-content/uploads/2020/02/fantech-logo-red.png", layout: [] }
};

let controllerIndex = null;
let currentLayout = [];

window.addEventListener("gamepadconnected", (e) => {
    console.log("connected:", e.gamepad.id)
    controllerIndex = e.gamepad.index;
    document.getElementById("status").style.display = "none";
    document.getElementById("controller-display").classList.remove("hidden");
    identifyModel(e.gamepad.id);
    setupUI(e.gamepad);
    updateLoop();
});

function identifyModel(id) {
    const idLower = id.toLowerCase();
    let found = FANTECH_MODELS["default"];
    
    for (const key in FANTECH_MODELS) {
        if (idLower.includes(key)) { found = FANTECH_MODELS[key]; break; }
    }

    document.getElementById("model-name").innerText = found.name;
    const imgEl = document.getElementById("controller-img");
    imgEl.src = found.img;
    currentLayout = found.layout;

    // Online Image Auto-Fallback
    imgEl.onerror = () => {
        imgEl.src = `https://source.unsplash.com/400x300/?gamepad,gaming,${found.name.split(' ')[0]}`;
    };
}

function setupUI(gp) {
    const btnGrid = document.getElementById("buttons-grid");
    btnGrid.innerHTML = "";
    gp.buttons.forEach((_, i) => {
        const label = currentLayout[i] || `B${i}`;
        btnGrid.innerHTML += `<div id="btn-${i}" class="btn-node">${label}</div>`;
    });
}

function updateLoop() {
    const gp = navigator.getGamepads()[controllerIndex];
    if (!gp) return;

    gp.buttons.forEach((btn, i) => {
        const el = document.getElementById(`btn-${i}`);
        if (el) btn.pressed ? el.classList.add("active") : el.classList.remove("active");
    });

    updateStick("stick-l", gp.axes[0], gp.axes[1]);
    updateStick("stick-r", gp.axes[2], gp.axes[3]);
    requestAnimationFrame(updateLoop);
}

function updateStick(id, x, y) {
    const dot = document.getElementById(id);
    const moveX = x * 45; const moveY = y * 45;
    dot.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    dot.style.background = (Math.abs(x) > 0.05 || Math.abs(y) > 0.05) ? "#ff0000" : "#fff";
}

document.getElementById("vibrate-btn").onclick = () => {
    const gp = navigator.getGamepads()[controllerIndex];
    if (gp?.vibrationActuator) {
        gp.vibrationActuator.playEffect("dual-rumble", { duration: 600, strongMagnitude: 1.0, weakMagnitude: 1.0 });
    }
};