const express = require('express');
const router = express.Router();
const marked = require('marked');

router.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    
    if (!prompt) {
        return res.status(400).json({ error: 'Prompt é obrigatório' });
    }

    const responses = {
        'oi': 'Olá! Como posso ajudar você hoje?',
        'ola': 'Olá! Em que posso ser útil?',
        'bom dia': 'Bom dia! Como posso ajudar?',
        'boa tarde': 'Boa tarde! Em que posso auxiliar?',
        'boa noite': 'Boa noite! Como posso ajudar?',
        'como voce esta': 'Estou funcionando perfeitamente, obrigado por perguntar!',
        'qual seu nome': 'Sou o assistente virtual da Ia cirus, como posso ajudar?',
        'ajuda': 'Claro! Posso ajudar com informações básicas. O que você precisa?',
        'preciso de ajuda': 'Claro! Posso ajudar com informações básicas. O que você precisa?',
        'qual é seu nome': 'Sou o assistente virtual da Iacirus, como posso ajudar?',
        'quem é você': 'Sou o assistente virtual da Ia cirus, como posso ajudar?',
        'nome': 'Sou o assistente virtual da Iacirus, como posso ajudar?',
        'franca': 'capital da França e Paris!',
        'brasil': 'capital do Brasil e Brasilia'
    };

    const lowerPrompt = prompt.toLowerCase()
        .trim()
        .replace(/[^a-z0-9\sáàâãäéèêëíìîïóòôõöúùûüç]/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()
        .replace(/[ã]/g, 'a')  
        .replace(/[áàâä]/g, 'a')  
        .replace(/[éèêë]/g, 'e')  
        .replace(/[íìîï]/g, 'i')  
        .replace(/[óòôö]/g, 'o')  
        .replace(/[úùûü]/g, 'u')  
        .replace(/[?.,!;:]/g, ''); 

    const stream = req.body.stream || false;
  
    console.log('\n=== NOVA REQUISIÇÃO ===');
    console.log('Prompt original:', prompt);
    console.log('Prompt limpo:', lowerPrompt);
    console.log('Respostas disponíveis:', Object.keys(responses));
    console.log('Verificando correspondência exata...');
   
    let response = responses[lowerPrompt];
    
    if (!response) {
        console.log('Nenhuma correspondência exata encontrada');
        console.log('Verificando frases completas...');
        
        for (const [key, value] of Object.entries(responses)) {
            console.log(`Verificando frase: "${key}"`);
            if (lowerPrompt === key) {
                console.log(`Correspondência encontrada para frase completa: "${key}"`);
                response = value;
                break;
            }
        }
        
        if (!response) {
            console.log('Nenhuma frase completa encontrada, verificando palavras-chave...');
            const words = lowerPrompt.split(' ');
            for (const word of words) {
                console.log(`Verificando palavra: "${word}"`);
                if (responses[word]) {
                    console.log(`Correspondência encontrada para palavra-chave: "${word}"`);
                    response = responses[word];
                    break;
                }
            }
        }
    }

    if (!response) {
        console.log('Nenhuma correspondência encontrada, usando resposta padrão');
        response = `Você disse: "${prompt}". Não consegui entender, consegue me explicar um pouco melhor?.`;
    }
    
    console.log('Resposta selecionada:', response);
    console.log('=== FIM DA REQUISIÇÃO ===\n');

    if (stream) {
        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');
        
        const chunkSize = 10;
        for (let i = 0; i < response.length; i += chunkSize) {
            const chunk = response.slice(i, i + chunkSize);
            res.write(chunk);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        res.end();
    } else {
        const htmlResponse = marked.parse(response);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ response: htmlResponse }));
    }
});

module.exports = router;
