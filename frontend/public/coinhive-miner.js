// ============================================================
// ATALAIA AUDIT AMMUNITION: FAKE CRYPTO MINER
// ============================================================
// This script simulates a WebWorker cryptocurrency miner like Coinhive.
// It runs a heavy while loop to artificially spike CPU usage, 
// creating a severe performance bottleneck and triggering DAST/Behavioral alarms.

console.log("[ATALAIA TARGET] Initializing Coinhive Monero Miner v2.1.4 (Simulated)...");

// Spin the CPU aggressively
function mine() {
    let hashes = 0;
    setInterval(() => {
        const start = performance.now();
        // Block the worker thread for 50ms every 100ms
        while (performance.now() - start < 50) {
            hashes++;
            Math.random() * Math.random(); // Waste cycles
        }
    }, 100);
}

mine();
