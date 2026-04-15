import React from 'react';
import './Institutional.css';

export default function Stores() {
    return (
        <div className="institutional-container">
            <h1>Lojas Físicas</h1>
            <p style={{ textAlign: 'center', marginBottom: '40px' }}>
                A experiência ATALAIA não pode ser apenas vista; ela deve ser sentida. Nossas concept stores são verdadeiros bunkers de alta moda, projetadas por arquitetos renomados.
            </p>

            <div className="store-card">
                <h3>Flagship São Paulo (Jardins)</h3>
                <p>Rua Oscar Freire, 1024 - Cerqueira César, São Paulo - SP</p>
                <p><strong>Horário:</strong> Seg a Sáb - 10h às 20h</p>
                <p><strong>Serviços Exclusivos:</strong> Personal Styling, Ateliê de Ajustes, Champanheria.</p>
            </div>

            <div className="store-card">
                <h3>ATALAIA Rio de Janeiro (Ipanema)</h3>
                <p>Rua Garcia d'Avila, 120 - Ipanema, Rio de Janeiro - RJ</p>
                <p><strong>Horário:</strong> Seg a Sáb - 10h às 19h</p>
                <p><strong>Serviços Exclusivos:</strong> Preview de Coleções, VIP Room.</p>
            </div>

            <div className="store-card">
                <h3>Concept Store Curitiba (Leblon)</h3>
                <p>Shopping Pátio Batel - Piso L2</p>
                <p><strong>Horário:</strong> Seg a Sáb - 10h às 22h | Dom - 14h às 20h</p>
                <p><strong>Serviços Exclusivos:</strong> Curadoria de Acessórios, Retirada Online.</p>
            </div>
        </div>
    );
}
