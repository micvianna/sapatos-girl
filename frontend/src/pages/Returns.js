import React from 'react';
import './Institutional.css';

export default function Returns() {
    return (
        <div className="institutional-container">
            <h1>Trocas e Devoluções</h1>
            <div className="institutional-hero">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" style={{ height: '300px' }} alt="Atalaia Embalagem e Estilo" />
            </div>
            <p>Nosso objetivo é que você reconheça o poder do seu sapato ATALAIA no instante em que calçá-lo. Mas caso seja necessário trocar a fôrma, criamos um processo <em>white-glove</em> sem stress ou burocracia.</p>

            <h2>Condições do Serviço</h2>
            <ul>
                <li>O prazo para solicitar a primeira troca grátis ou a devolução por arrependimento é de <strong>7 dias úteis</strong> após a entrega (Art. 49).</li>
                <li>Para que a mágica aconteça, a peça deve estar <strong>impecável</strong>: sem indícios de uso na sola, acompanhada da caixa magna original, papéis de seda e <em>dust bags</em>.</li>
                <li>Peças personalizadas da linha Bespoke ou itens comprados na aba SALE com desconto final não são elegíveis a troca por arrependimento, apenas devolução de crédito em loja.</li>
            </ul>

            <h2>A Sistemática</h2>
            <p>1. Entre em contato via SAC e declare a intenção de troca.</p>
            <p>2. Você receberá um código VIP de logística reversa. Em capitais, agendamos motoboys para buscar a peça diretamente na sua casa.</p>
            <p>3. Após a checagem no nosso <em>Quality Center</em>, despachamos a nova numeração via Sedex Black (Prazo de expedição de 48h).</p>

            <p style={{ marginTop: '40px' }}>
                Para iniciar o processo imediatamente, <a href="/contato" style={{ color: '#111', fontWeight: 'bold' }}>fale conosco aqui</a>.
            </p>
        </div>
    );
}
