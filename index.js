document.getElementById('send').addEventListener('click', sendMessage);
document.getElementById('prompt').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

async function sendMessage() {
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value;

    // Validação de entrada
    if (prompt.length < 10 || prompt.length > 100) {
        alert('O prompt deve ter entre 10 e 100 caracteres.');
        return;
    }

    // Exibir carregando e tela de processamento
    document.getElementById('loading').style.display = 'block';
    document.getElementById('processing').style.display = 'flex';

    const chatDiv = document.getElementById('chat');
    chatDiv.innerHTML += `<div><strong>Você:</strong> ${prompt}</div>`;
    
    // Criar elemento para resposta da IA
    const aiResponseDiv = document.createElement('div');
    aiResponseDiv.innerHTML = `<strong>IA:</strong> `;
    chatDiv.appendChild(aiResponseDiv);

    // Chamada à API com streaming
    try {
        const response = await fetch('http://localhost:3001/iacirus/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                prompt,
                stream: true 
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // delay 2 segundos
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let responseText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            
            const chunk = decoder.decode(value, { stream: true });
            try {
                const jsonData = JSON.parse(chunk);
                responseText += jsonData.response;
            } catch (e) {
                responseText += chunk;
            }
            aiResponseDiv.innerHTML = `<strong>IA:</strong> ${responseText}`;

            chatDiv.scrollTop = chatDiv.scrollHeight;
        }

    } catch (error) {
        console.error('Erro ao chamar a API:', error);
        aiResponseDiv.innerHTML = `<strong>Erro:</strong> ${error.message}`;
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('processing').style.display = 'none';
        promptInput.value = '';
    }

};
