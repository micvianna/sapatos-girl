import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';

export default function Account() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div style={{ padding: '80px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center', minHeight: '50vh' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Minha Conta</h2>
            <div style={{ padding: '30px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#fff' }}>
                <p style={{ margin: '10px 0', fontSize: '1.2rem' }}><strong>Nome:</strong> {user?.nome || 'Usuário'}</p>
                <p style={{ margin: '10px 0', fontSize: '1.1rem', color: '#666' }}><strong>Email:</strong> {user?.email}</p>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: '30px',
                        padding: '12px 30px',
                        backgroundColor: '#ff1493',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                    }}
                >
                    Sair da Conta (Logout)
                </button>
            </div>
        </div>
    );
}
