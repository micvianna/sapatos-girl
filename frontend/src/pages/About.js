import React from 'react';
import './Institutional.css';

export default function About() {
    return (
        <div className="institutional-container">
            <div className="institutional-hero">
                <img src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" alt="Atalaia High Fashion" />
            </div>
            <h1>A Marca ATALAIA</h1>
            <p>Nascida do desejo de subverter o comum, a <strong>ATALAIA</strong> (anteriormente conhecida como Shoe Style) representa a vanguarda do calçado e acessórios femininos. Não criamos apenas sapatos; nós esculpimos a potência do real.</p>

            <h2>Nossa Filosofia</h2>
            <p>Acreditamos que o que você veste nos pés é a fundação da sua postura perante o mundo. Nossas peças combinam a brutalidade da infraestrutura urbana com a delicadeza intocável do design high-end. Couro, texturas, metais e saltos geométricos são nossas assinaturas.</p>

            <h2>Um Novo Padrão de Estética</h2>
            <p>Em 2026, reposicionamos toda a nossa marca para refletir aquilo que nossas clientes mais audaciosas já sabiam: ATALAIA é para quem dita as regras, não para quem as segue. Do acabamento meticuloso em nossas bolsas até o último zíper em nossas botas, tudo é desenhado com uma estética premium implacável.</p>

            <p style={{ textAlign: 'center', marginTop: '50px', fontStyle: 'italic', fontSize: '1.2rem' }}>
                "Caminhe não para chegar a algum lugar, mas para fazer a terra reconhecer seus passos."
            </p>
        </div>
    );
}
