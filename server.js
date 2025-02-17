const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const chatRouter = require('./chat');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json());
app.use('/iacirus', express.static(__dirname));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Usando a rota do chat.js
app.use('/iacirus/api', chatRouter);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});