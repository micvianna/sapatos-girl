import React, { useState, useEffect } from 'react';
import './RansomwareModal.css';

// DAST / Scam Bait
export default function RansomwareModal() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Randomly pop up after ~5 to 15 seconds to simulate an infection payload
        const timer = setTimeout(() => {
            setVisible(true);
        }, Math.random() * 10000 + 5000);

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className="malware-overlay">
            <div className="malware-box">
                <h1>⚠️ YOUR BROWSER IS ENCRYPTED ⚠️</h1>
                <p>
                    All your files and web history have been locked using military-grade RSA-4096 algorithms.
                </p>
                <p className="countdown">
                    Time remaining: <strong>47:59:59</strong>
                </p>
                <div className="bitcoin-box">
                    <p>Send <strong>0.5 BTC</strong> to this address to decrypt:</p>
                    <code>bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</code>
                </div>
                <button
                    className="pay-btn"
                    onClick={() => window.open('https://bitcoin.org', '_blank')}
                >
                    I HAVE PAID
                </button>
                <p className="fake-warning">Do not close this window. Restarting will delete your files permanently.</p>
            </div>
        </div>
    );
}
