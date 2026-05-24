import React from 'react';
import './Institutional.css';

export default function Faq() {
    return (
        <div className="institutional-container">
            <h1>Dúvidas Frequentes</h1>
            <p>A exclusividade da ATALAIA costuma gerar curiosidade. Compilamos aqui as respostas para as dúvidas mais comuns de nossas clientes.</p>

            <div style={{ marginTop: '40px' }}>
                <div className="faq-item">
                    <h3>Como sei qual é a minha numeração exata nas botas ATALAIA?</h3>
                    <p>Nossas formas seguem o padrão italiano de alta costura. Se você oscila entre dois números, recomendamos sempre a numeração maior para maior conforto, especialmente nas linhas Combat e Over the Knee. Oferecemos nosso Guia de Medidas 3D caso precise de precisão cirúrgica.</p>
                </div>

                <div className="faq-item">
                    <h3>A ATALAIA oferece peças sob medida?</h3>
                    <p>Nossa linha <em>ATALAIA Bespoke</em> está disponível apenas mediante agendamento direto na Flagship de São Paulo. Lá nossos mestres sapateiros podem ajustar panturrilha, peito de pé e customizar materiais.</p>
                </div>

                <div className="faq-item">
                    <h3>Como devo armazenar as bolsas e os calçados de couro?</h3>
                    <p>Seus produtos ATALAIA chegam acompanhados de <em>dust bags</em> de algodão egípcio. Sempre guarde-os dentro destas embalagens em um local seco. Nunca coloque peças em tons claros ao lado de peças tingidas que possam transferir cor.</p>
                </div>

                <div className="faq-item">
                    <h3>O site travou enquanto eu finalizava um lançamento exclusivo. E agora?</h3>
                    <p>Nossos <em>Drops</em> (lançamentos de coleções limitadas) costumam esgotar em menos de 10 minutos, causando alta volatilidade no carrinho de compras. Infelizmente não reservamos carrinhos. Quem finaliza o pagamento primeiro tem o produto garantido.</p>
                </div>
            </div>
        </div>
    );
}
