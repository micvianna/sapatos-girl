const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.is_admin) {
            return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
        }
        req.adminUser = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Token malformado' });
        }
        return res.status(401).json({ error: 'Token inválido' });
    }
}

module.exports = adminAuth;
