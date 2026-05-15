// =============================================
// Transum Pill UI — Chrome Extension
// Toggle with Ctrl+Q
// =============================================

let pillVisible = false;
let pillUI = null;
let pillStyles = null;

function createPill() {
    if (document.getElementById('transum-pill-ui')) return;

    // ---------- INJECT FONT ----------
    if (!document.getElementById('transum-font')) {
        const link = document.createElement('link');
        link.id = 'transum-font';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }

    // ---------- INJECT STYLES ----------
    pillStyles = document.createElement('style');
    pillStyles.id = 'transum-styles';
    pillStyles.textContent = `
        #transum-pill-ui * {
            box-sizing: border-box;
            font-family: 'DM Sans', system-ui, sans-serif;
        }
        #transum-pill-ui .t-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 74px;
            height: 74px;
            margin: 0 auto 4px;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            transition: transform 0.18s cubic-bezier(.34,1.56,.64,1), box-shadow 0.18s ease, background 0.15s ease;
            position: relative;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 2px 8px rgba(255,100,0,0.10), 0 1px 2px rgba(0,0,0,0.06);
        }
        #transum-pill-ui .t-btn::before {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.6) 0%, transparent 60%);
            border-radius: inherit;
            pointer-events: none;
        }
        #transum-pill-ui .t-btn:hover {
            transform: translateY(-2px) scale(1.04);
            box-shadow: 0 8px 24px rgba(255,100,0,0.22), 0 2px 6px rgba(0,0,0,0.08);
        }
        #transum-pill-ui .t-btn:active {
            transform: scale(0.93);
            box-shadow: 0 2px 8px rgba(255,100,0,0.15);
        }
        #transum-pill-ui .t-btn.pressed {
            background: linear-gradient(135deg, #ff6a00, #ff9a00) !important;
            box-shadow: 0 6px 20px rgba(255,106,0,0.40) !important;
        }
        #transum-pill-ui .t-btn.pressed .t-icon { color: #fff !important; }
        #transum-pill-ui .t-btn.pressed .t-label { color: rgba(255,255,255,0.85) !important; }
        #transum-pill-ui .t-icon {
            font-size: 26px;
            line-height: 1;
            color: #ff6a00;
            transition: color 0.15s;
        }
        #transum-pill-ui .t-label {
            font-size: 10.5px;
            font-weight: 600;
            letter-spacing: 0.3px;
            color: #666;
            margin-top: 5px;
            text-transform: uppercase;
            transition: color 0.15s;
        }
        #transum-pill-ui .t-divider {
            width: 44px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #f0e0d0, transparent);
            margin: 6px auto;
        }
        #transum-pill-ui .t-status {
            font-size: 11.5px;
            font-weight: 500;
            text-align: center;
            min-height: 20px;
            padding: 6px 12px 2px;
            color: #ff6a00;
            letter-spacing: 0.2px;
            transition: opacity 0.3s;
        }

        /* Popup */
        #transum-popup {
            font-family: 'DM Sans', system-ui, sans-serif;
            background: #fff;
            border-radius: 16px;
            box-shadow: 0 12px 40px rgba(255,100,0,0.15), 0 4px 12px rgba(0,0,0,0.10);
            padding: 6px 0;
            border: 1px solid rgba(255,120,0,0.15);
            overflow: hidden;
        }
        #transum-popup .pop-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 11px 16px;
            background: none;
            border: none;
            text-align: left;
            font-size: 13.5px;
            font-weight: 500;
            color: #333;
            cursor: pointer;
            transition: background 0.15s, color 0.15s;
            letter-spacing: 0.1px;
        }
        #transum-popup .pop-item:hover {
            background: #fff5ee;
            color: #ff6a00;
        }
        #transum-popup .pop-item.danger { color: #e03030; }
        #transum-popup .pop-item.danger:hover { background: #fff0f0; color: #c02020; }
        #transum-popup .pop-sep {
            height: 1px;
            background: #f5ede6;
            margin: 4px 12px;
        }
    `;
    document.head.appendChild(pillStyles);

    // ---------- CREATE UI ----------
    const ui = document.createElement("div");
    ui.id = "transum-pill-ui";
    ui.style.cssText = `
        position: fixed;
        top: 80px;
        left: 80px;
        z-index: 2147483647;
        width: 106px;
        border-radius: 30px;
        background: linear-gradient(160deg, #ffffff 60%, #fff8f3 100%);
        border: 1px solid rgba(255,140,60,0.20);
        box-shadow:
            0 20px 60px rgba(255,100,0,0.12),
            0 4px 16px rgba(0,0,0,0.07),
            inset 0 1px 0 rgba(255,255,255,0.9);
        padding: 16px 0 14px;
        user-select: none;
    `;

    ui.innerHTML = `
        <div id="t-title" style="
            text-align: center;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            color: #ff6a00;
            margin-bottom: 14px;
            padding: 0 10px;
        ">TRANSUM</div>

        <button class="t-btn" id="fill">
            <span class="t-icon">✓</span>
            <span class="t-label">Fill All</span>
        </button>

        <div class="t-divider"></div>

        <button class="t-btn" id="check">
            <span class="t-icon">↻</span>
            <span class="t-label">Check</span>
        </button>

        <div class="t-divider"></div>

        <button class="t-btn" id="more">
            <span class="t-icon">⋯</span>
            <span class="t-label">More</span>
        </button>

        <div class="t-status" id="t-status"></div>
    `;

    document.body.appendChild(ui);
    pillUI = ui;
    pillVisible = true;

    const fillBtn  = ui.querySelector("#fill");
    const checkBtn = ui.querySelector("#check");
    const moreBtn  = ui.querySelector("#more");
    const status   = ui.querySelector("#t-status");

    // ---------- BUTTON PRESS HELPERS ----------
    function press(btn) { btn.classList.add('pressed'); }
    function release(btn) { btn.classList.remove('pressed'); }

    function showStatus(msg, isError) {
        status.style.color = isError ? '#e03030' : '#ff6a00';
        status.style.opacity = '0';
        status.textContent = msg;
        requestAnimationFrame(() => { status.style.opacity = '1'; });
    }

    // ---------- DRAG ----------
    let drag = false, ox, oy;
    ui.onmousedown = e => { drag = true; ox = e.clientX - ui.offsetLeft; oy = e.clientY - ui.offsetTop; };
    document.onmousemove = e => { if (drag) { ui.style.left = e.clientX - ox + "px"; ui.style.top = e.clientY - oy + "px"; } };
    document.onmouseup = () => { drag = false; };

    // =============================================
    // FILL ANSWERS
    // =============================================
    fillBtn.onclick = () => {
        press(fillBtn);
        showStatus("Filling…");

        const source = document.documentElement.outerHTML;
        const regex = /Guess(\d+).*?==\s*['"]?([\d.]+)['"]?/gi;
        const matches = [...source.matchAll(regex)];
        const answers = {};
        matches.forEach(m => answers[parseInt(m[1])] = m[2].trim());

        let filled = 0;
        for (let i = 1; i <= 40; i++) {
            const input = document.querySelector(`input[name="Guess${i}"]`);
            if (input && answers[i] && !input.value) {
                input.value = answers[i];
                input.dispatchEvent(new Event("input", { bubbles: true }));
                input.dispatchEvent(new Event("change", { bubbles: true }));
                filled++;
            }
        }

        showStatus(filled ? `Filled ${filled} ✓` : "Nothing found", !filled);
        setTimeout(() => release(fillBtn), 900);
    };

    // =============================================
    // CHECK
    // =============================================
    checkBtn.onclick = () => {
        press(checkBtn);
        showStatus("Checking…");
        let clicked = false;

        const idBtn = document.getElementById("Checkbutton");
        if (idBtn) { idBtn.click(); clicked = true; }

        if (!clicked) {
            const classBtn = document.querySelector(".ButCheck");
            if (classBtn) { classBtn.click(); clicked = true; }
        }

        if (!clicked) {
            const onclickBtn = document.querySelector('[onclick*="checkAnswers"]');
            if (onclickBtn) { onclickBtn.click(); clicked = true; }
        }

        if (!clicked) {
            try {
                if (typeof RemoveSpaces === "function") RemoveSpaces();
                if (typeof checkAnswers === "function") { checkAnswers(); clicked = true; }
            } catch (e) {}
        }

        if (!clicked) {
            const inputs = document.querySelectorAll("input[name^='Guess']");
            if (inputs.length) {
                inputs[inputs.length - 1].dispatchEvent(
                    new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
                );
                clicked = true;
            }
        }

        showStatus(clicked ? "Checked ✓" : "Check failed", !clicked);
        setTimeout(() => release(checkBtn), 800);
    };

    // =============================================
    // POPUP MENU
    // =============================================
    let popup = null;
    let darkMode = false;

    function closePopup() {
        if (popup) { popup.remove(); popup = null; }
        release(moreBtn);
    }

    moreBtn.onclick = () => {
        press(moreBtn);
        if (popup) { closePopup(); return; }

        popup = document.createElement("div");
        popup.id = "transum-popup";
        popup.style.cssText = "position:fixed;width:182px;z-index:2147483647;";

        const rect = moreBtn.getBoundingClientRect();
        popup.style.left = rect.right + 10 + "px";
        popup.style.top  = rect.top + "px";

        popup.innerHTML = `
            <button class="pop-item" id="t-theme">
                <span>${darkMode ? '☀️' : '🌙'}</span>
                <span>${darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <div class="pop-sep"></div>
            <button class="pop-item danger" id="t-close">
                <span>✕</span>
                <span>Close Panel</span>
            </button>
        `;
        document.body.appendChild(popup);

        document.getElementById('t-theme').onclick = () => {
            darkMode = !darkMode;
            if (darkMode) {
                ui.style.background = "linear-gradient(160deg, #1e1e1e 60%, #2a1a0e 100%)";
                ui.style.borderColor = "rgba(255,140,60,0.25)";
                ui.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)";
                ui.querySelector("#t-title").style.color = "#ff8c3a";
                ui.querySelectorAll(".t-btn").forEach(b => {
                    b.style.background = "#2a2a2a";
                    b.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                });
                ui.querySelectorAll(".t-label").forEach(l => l.style.color = "#888");
            } else {
                ui.style.background = "linear-gradient(160deg, #ffffff 60%, #fff8f3 100%)";
                ui.style.borderColor = "rgba(255,140,60,0.20)";
                ui.style.boxShadow = "0 20px 60px rgba(255,100,0,0.12), 0 4px 16px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.9)";
                ui.querySelector("#t-title").style.color = "#ff6a00";
                ui.querySelectorAll(".t-btn").forEach(b => {
                    b.style.background = "#fff";
                    b.style.boxShadow = "0 2px 8px rgba(255,100,0,0.10), 0 1px 2px rgba(0,0,0,0.06)";
                });
                ui.querySelectorAll(".t-label").forEach(l => l.style.color = "#666");
            }
            closePopup();
        };

        document.getElementById('t-close').onclick = () => {
            popup.remove();
            destroyPill();
        };

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('mousedown', function outsideClick(e) {
                if (!popup?.contains(e.target) && e.target !== moreBtn) {
                    closePopup();
                    document.removeEventListener('mousedown', outsideClick);
                }
            });
        }, 10);
    };
}

function destroyPill() {
    const ui = document.getElementById('transum-pill-ui');
    if (ui) ui.remove();
    const popup = document.getElementById('transum-popup');
    if (popup) popup.remove();
    const styles = document.getElementById('transum-styles');
    if (styles) styles.remove();
    pillVisible = false;
    pillUI = null;
}

// ---------- CTRL+Q TOGGLE ----------
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'q') {
        e.preventDefault();
        if (document.getElementById('transum-pill-ui')) {
            destroyPill();
        } else {
            createPill();
        }
    }
});
