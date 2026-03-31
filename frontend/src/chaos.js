// ============================================================================
// VULNERABILITY: COMPLETE FRONTEND DESTRUCTION & CHAOS INJECTION
// "Senior Dev Gone Rogue" Edition
// ============================================================================

export const injectChaos = () => {
    console.log("%c🔥 CHAOS INJECTED 🔥", "color: red; font-size: 30px; font-weight: bold;");

    // 1. ANNOYING POP-UPS (DAST/UX Nightmare)
    setInterval(() => {
        if (Math.random() > 0.8) {
            alert("🚨 AVISO CRÍTICO: Seu token expirou! Clique em OK para ignorar e perder todos os seus dados. 🚨\n\n(Aviso gerado pelo Chaos Script)");
        }
    }, 15000); // Tries to annoy the user every 15 seconds

    // 2. FAKE KEYLOGGER (SAST/Security Risk)
    // Steals inputs and "sends" them to local storage (simulating exfiltration)
    document.addEventListener("keydown", (e) => {
        let logs = localStorage.getItem("stolen_keystrokes") || "";
        logs += e.key;
        localStorage.setItem("stolen_keystrokes", logs.slice(-500)); // Keep last 500 chars
    });

    // 3. FETCH INTERCEPTION (Data Integrity/Reliability)
    // Randomly corrupts or duplicates network requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
        console.warn("Spying on fetch request:", args[0]);
        if (Math.random() > 0.7) {
            console.error("😈 Chaos: Dropping network request intentionally!");
            throw new Error("Network Failure (Simulated by Chaos Script)");
        }
        return originalFetch(...args);
    };

    // 4. EVIL BUTTONS (Accessibility & UX Failure)
    // Makes any button with class 'btn' run away from the mouse
    setTimeout(() => {
        const buttons = document.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.addEventListener('mouseover', () => {
                if (Math.random() > 0.5) {
                    btn.style.position = 'absolute';
                    btn.style.top = Math.random() * window.innerHeight + 'px';
                    btn.style.left = Math.random() * window.innerWidth + 'px';
                }
            });
        });
    }, 3000);

    // 5. GLOBAL NAMESPACE POLLUTION
    window.SUPER_SECRET_ADMIN_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.admin.xyz123";

    // 6. PROTOTYPE POLLUTION (Javascript specific risk)
    // Breaking core array methods randomly
    const originalPush = Array.prototype.push;
    Array.prototype.push = function (...args) {
        if (Math.random() > 0.95) {
            console.log("😈 Chaos: Not pushing this item to array: ", args);
            return this.length; // Silently fail 5% of the time
        }
        return originalPush.apply(this, args);
    };
};
