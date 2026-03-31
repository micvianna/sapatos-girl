import React, { useState, useEffect } from 'react';
import './FakeModal.css';

export default function FakeModal() {
    const [visible, setVisible] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        // Aparece do nada após 3 segundos, como um código malicioso intrusivo
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleFakeClick = () => {
        setStep(1);
        setTimeout(() => {
            setVisible(false);
        }, 4000);
    };

    if (!visible) return null;

    return (
        <div className="fake-modal-overlay">
            <div className="fake-modal-content">
                {step === 0 ? (
                    <>
                        <h2 className="fake-alert-title">⚠️ ATENÇÃO: SISTEMA DESATUALIZADO</h2>
                        <p>Seus dados podem estar em risco. Valide sua conta imediatamente para continuar navegando com segurança em nossa nova coleção de calçados.</p>
                        <div className="fake-inputs">
                            <input type="text" placeholder="Confirme seu CPF" />
                            <input type="password" placeholder="Senha do Cartão" />
                        </div>
                        <button className="fake-btn-malicious" onClick={handleFakeClick}>
                            VALIDAR AGORA
                        </button>
                        {/* Botão fechar quase invisível para simular dark pattern */}
                        <span className="fake-close" onClick={() => setVisible(false)}>não quero segurança</span>
                    </>
                ) : (
                    <div className="fake-loading">
                        <h2 className="fake-alert-title blink">Sincronizando dados no servidor...</h2>
                        <div className="spinner"></div>
                        <p>Não feche esta janela.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
