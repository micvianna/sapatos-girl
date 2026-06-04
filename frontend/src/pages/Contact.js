import React from 'react';
import './Institutional.css';

export default function Contact() {
    return (
        <div className="institutional-container">
            <h1>Entre em Contato</h1>
            <p>Na ATALAIA, a sua experiência é nossa prioridade absoluta. Se você tem dúvidas sobre nossos produtos, pedidos, ou simplesmente quer falar conosco, nossos canais de atendimento premium estão abertos.</p>

            <div className="contact-grid">
                <div style={{ background: '#fdfbf7', padding: '30px', border: '1px solid #eaeaea' }}>
                    <h3>Atendimento ao Cliente (SAC)</h3>
                    <p style={{ marginTop: '15px' }}><strong>Email:</strong> sac@atalaia.com.br</p>
                    <p><strong>Telefone:</strong> (11) 4004-0000</p>
                    <p><strong>WhatsApp VIP:</strong> (11) 98765-4321</p>
                    <p style={{ fontSize: '0.9rem', marginTop: '15px' }}>Horário: Segunda a Sexta, das 09h às 18h.</p>
                </div>

                <div style={{ background: '#111', color: '#fff', padding: '30px' }}>
                    <h3 style={{ color: '#fff' }}>Assessoria de Imprensa</h3>
                    <p style={{ marginTop: '15px', color: '#ccc' }}>Para editoriais, parcerias de PR e empréstimo de peças.</p>
                    <p style={{ marginTop: '15px', color: '#ccc' }}><strong>Email:</strong> press@atalaia.com.br</p>
                    <p style={{ color: '#ccc' }}>Aos cuidados de Alice Brandão.</p>
                </div>
            </div>

            <h2 style={{ marginTop: '60px' }}>Envie uma Mensagem</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" placeholder="Nome Completo" style={{ padding: '15px', border: '1px solid #ccc', background: 'transparent' }} required />
                <input type="email" placeholder="E-mail" style={{ padding: '15px', border: '1px solid #ccc', background: 'transparent' }} required />
                <input type="text" placeholder="Número do Pedido (Opcional)" style={{ padding: '15px', border: '1px solid #ccc', background: 'transparent' }} />
                <textarea rows="5" placeholder="Sua mensagem..." style={{ padding: '15px', border: '1px solid #ccc', background: 'transparent', resize: 'vertical' }} required></textarea>
                <button type="button" onClick={() => alert('Mensagem enviada com sucesso!')} style={{ padding: '15px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    Enviar Mensagem
                </button>
            </form>
        </div>
    );
}
