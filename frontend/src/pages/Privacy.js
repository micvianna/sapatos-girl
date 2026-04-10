import React from 'react';
import './Institutional.css';

export default function Privacy() {
    return (
        <div className="institutional-container">
            <h1>Política de Privacidade</h1>
            <p style={{ fontStyle: 'italic', marginBottom: '40px' }}>Última Atualização: 01 de Abril de 2026</p>

            <h2>1. Nosso Compromisso com o Sigilo</h2>
            <p>A ATALAIA reconhece que o verdadeiro luxo inclui a privacidade absoluta. Tratamos seus dados com a mesma obsessão que temos com o alinhamento das costuras de nossas botas. Suas informações pessoais são um patrimônio protegido pelas leis globais mais rígidas (LGPD e GDPR).</p>

            <h2>2. Coleta de Dados</h2>
            <p>Coletamos informações exclusivas para aprimorar sua experiência de compra, como suas preferências de cor, numeração de calçado e histórico de navegação no nosso e-commerce. Não vendemos, trocamos ou expomos seus dados a corretores terceirizados.</p>

            <h2>3. Segurança dos Pagamentos</h2>
            <p>Nossos gateways são blindados com criptografia militar de 256 bits e certificação PCI-DSS de Nível 1. Os dados de seu cartão de crédito nunca são armazenados em nossos servidores, garantindo uma transação limpa e fantasma.</p>

            <h2>4. Seus Direitos</h2>
            <p>Você pode solicitar a exclusão imediata e permanente do seu histórico de compras e perfil a qualquer momento através do e-mail <strong>privacy@atalaia.com.br</strong>. Na ATALAIA, você tem o controle do tabuleiro.</p>
        </div>
    );
}
