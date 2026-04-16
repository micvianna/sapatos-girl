import React from 'react';
import './Institutional.css';

export default function Shipping() {
    return (
        <div className="institutional-container">
            <h1>Prazos e Tipos de Entrega</h1>
            <p>O luxo só atinge a plenitude se chegar às suas mãos no ápice da sua antecipação. Nosso hub logístico foi desenhado para ser rápido, anônimo e seguro.</p>

            <h2>ATALAIA Black (Same-Day)</h2>
            <p>Disponível exclusivamente para a Grande São Paulo. Se a sua compra for confirmada antes das 12:00 do meio-dia, o seu sapato chegará através do nosso motorista particular até às 21:00 do mesmo dia. Entrega rastreada por geolocalização e senha dinâmica.</p>

            <h2>Entrega Expressa Nacional</h2>
            <p>Realizada pelas nossas operadoras aéreas terceirizadas. Os prazos começam a contar apenas após o e-mail de "Sua Atalaia está a caminho":</p>
            <ul>
                <li>Capitais Sul e Sudeste: <strong>1 a 3 dias úteis</strong></li>
                <li>Capitais Centro-Oeste e Nordeste: <strong>3 a 5 dias úteis</strong></li>
                <li>Norte, Interior e áreas remotas: <strong>6 a 12 dias úteis</strong></li>
            </ul>

            <h2>Frete Internacional</h2>
            <p>A ATALAIA despacha para Estados Unidos, Europa e Emirados Árabes. As entregas são executadas em modalidade DHL Premium (3 a 7 dias). Taxas e deveres aduaneiros (DDP, se cobrados) são da responsabilidade da compradora.</p>
        </div>
    );
}
