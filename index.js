const express = require('express');
const Database = require('better-sqlite3');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 8000;
const SECRET = process.env.SECRET || "fallback_dev"; // ✅ corrigido

app.use(express.json());

// Banco
const db = new Database('/tmp/produtos.db');

// 🔹 Criar tabelas
db.prepare(`
CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    categoria_id INTEGER,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
)
`).run();

// 🔹 Categorias padrão
db.prepare(`
INSERT OR IGNORE INTO categorias (id, nome) VALUES
(1, 'Informática'),
(2, 'Eletrônicos'),
(3, 'Casa')
`).run();


// =========================
// 🔐 LOGIN
// =========================
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;

    if (usuario === 'admin' && senha === '123') {
        const token = jwt.sign({ usuario }, SECRET, { expiresIn: '1h' });
        return res.json({ token });
    }

    res.status(401).json({ erro: "Credenciais inválidas" });
});


// 🔐 Middleware
function autenticar(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ erro: "Token não enviado" });
    }

    const token = authHeader.split(' ')[1];

    try {
        jwt.verify(token, SECRET);
        next();
    } catch {
        res.status(401).json({ erro: "Token inválido" });
    }
}


// =========================
// 🔹 GET
// =========================
app.get('/api/produtos', (req, res) => {
    const produtos = db.prepare(`
        SELECT p.id, p.nome, p.preco, c.nome AS categoria
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
    `).all();

    res.json(produtos);
});


// 🔹 GET por ID
app.get('/api/produtos/:id', (req, res) => {
    const produto = db.prepare(`
        SELECT p.id, p.nome, p.preco, c.nome AS categoria
        FROM produtos p
        LEFT JOIN categorias c ON p.categoria_id = c.id
        WHERE p.id = ?
    `).get(req.params.id);

    if (!produto) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json(produto);
});


// 🔹 POST
app.post('/api/produtos', autenticar, (req, res) => {
    const { nome, preco, categoria_id } = req.body;

    if (!nome || nome.length < 3) {
        return res.status(400).json({ erro: "Nome inválido" });
    }

    if (preco == null || typeof preco !== 'number' || preco <= 0) {
        return res.status(400).json({ erro: "Preço inválido" });
    }

    const categoria = db.prepare('SELECT * FROM categorias WHERE id=?').get(categoria_id);

    if (!categoria) {
        return res.status(400).json({ erro: "Categoria não existe" });
    }

    const result = db.prepare(`
        INSERT INTO produtos (nome, preco, categoria_id)
        VALUES (?, ?, ?)
    `).run(nome, preco, categoria_id);

    res.status(201).json({ id: result.lastInsertRowid });
});


// 🔹 PUT
app.put('/api/produtos/:id', autenticar, (req, res) => {
    const { nome, preco, categoria_id } = req.body;

    const result = db.prepare(`
        UPDATE produtos
        SET nome=?, preco=?, categoria_id=?
        WHERE id=?
    `).run(nome, preco, categoria_id, req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json({ mensagem: "Atualizado" });
});


// 🔹 DELETE
app.delete('/api/produtos/:id', autenticar, (req, res) => {
    const result = db.prepare('DELETE FROM produtos WHERE id=?').run(req.params.id);

    if (result.changes === 0) {
        return res.status(404).json({ erro: "Produto não encontrado" });
    }

    res.json({ mensagem: "Deletado" });
});


// 🔹 Rota raiz
app.get('/', (req, res) => {
    res.send('API com JWT e JOIN funcionando 🚀');
});


app.listen(PORT, () => {
    console.log(`🚀 rodando na porta ${PORT}`);
});
