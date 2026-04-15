import React from 'react';
import './Institutional.css';

export default function Careers() {
    return (
        <div className="institutional-container">
            <h1>Trabalhe Conosco</h1>
            <div className="institutional-hero">
                <img src="https://images.unsplash.com/photo-1497215848122-4a00508a89ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" style={{ height: '300px' }} alt="Atalaia Team" />
            </div>
            <p>Nos bastidores da ATALAIA existe uma equipe obsecada pela perfeição. Estamos sempre em busca de talentos que não têm medo de desafiar o status quo da moda nacional e internacional.</p>

            <h2>Por que a ATALAIA?</h2>
            <ul>
                <li>Cultura de inovação agressiva: nós não copiamos tendências, nós as antecipamos.</li>
                <li>Ambiente de alta performance onde a estética encontra a tecnologia.</li>
                <li>Benefícios premium, incluindo acessos antecipados e descontos VIP.</li>
            </ul>

            <h2>Vagas em Destaque</h2>
            <div className="faq-item">
                <h3>Designer Sênior de Calçados (São Paulo, SP)</h3>
                <p>Criativo focado em arquitetura de sapatos pesados (combat boots, fivelas, tratorados). Requer inglês fluente e portfólio ousado.</p>
            </div>

            <div className="faq-item">
                <h3>E-commerce Tech Lead (Remoto)</h3>
                <p>Líder técnico para nossa plataforma React/Node.js. Experiência em alta escala e segurança da informação é obrigatória.</p>
            </div>

            <div className="faq-item">
                <h3>Gerente de Experiência VIP (Jardins, SP)</h3>
                <p>Profissional responsável pelo relacionamento com nossas top clientes na Flagship Store.</p>
            </div>

            <p style={{ marginTop: '40px', fontWeight: 'bold' }}>
                Tem o perfil para fazer parte do nosso clã? Envie seu currículo e portfólio para <strong>carreiras@atalaia.com.br</strong> com o assunto "Talento ATALAIA".
            </p>
        </div>
    );
}
