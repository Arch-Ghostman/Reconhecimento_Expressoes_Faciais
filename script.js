// Elementos do DOM
const video = document.getElementById('video');
const overlay = document.getElementById('overlay');
const statusElement = document.querySelector('.status');
const permissionButton = document.getElementById('webcam-permission');

// Elementos para exibir expressões
const expressionElements = {
    happy: document.getElementById('happy'),
    sad: document.getElementById('sad'),
    angry: document.getElementById('angry'),
    surprised: document.getElementById('surprised'),
    neutral: document.getElementById('neutral')
};

// Inicialmente esconder o botão de permissão
permissionButton.classList.add('hidden');

// Contexto do canvas para desenhar
const ctx = overlay.getContext('2d');

// Função para iniciar a webcam e exibir o vídeo
async function startWebcam() {
    try {
        // Acessar a webcam
        statusElement.textContent = 'Acessando a webcam...';
        
        // Verificar se o navegador suporta a API MediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Seu navegador não suporta acesso à webcam. Por favor, use um navegador mais recente como Chrome, Firefox ou Edge.');
        }
        
        // Tentar acessar a webcam com diferentes configurações
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user' // Câmera frontal
            }
        });
        
        // Verificar se o stream foi obtido corretamente
        if (!stream) {
            throw new Error('Não foi possível obter o stream da webcam.');
        }
        
        video.srcObject = stream;
        
        // Aguardar o carregamento do vídeo com timeout
        await Promise.race([
            new Promise(resolve => video.addEventListener('loadeddata', resolve)),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout ao carregar vídeo')), 10000))
        ]);
        
        statusElement.textContent = 'Webcam conectada com sucesso!';
        
        // Iniciar detecção de rostos simples
        startFaceDetection();
        
        return true;
    } catch (webcamError) {
        console.error('Erro ao acessar webcam:', webcamError);
        statusElement.textContent = `Erro ao acessar webcam: ${webcamError.message}. Verifique se sua câmera está conectada e se você permitiu o acesso.`;
        return false;
    }
}

// Função para iniciar a aplicação
async function startApp() {
    try {
        // Iniciar a webcam
        const webcamStarted = await startWebcam();
        if (!webcamStarted) {
            return;
        }
        
        // Ajustar o tamanho do canvas para corresponder ao vídeo
        overlay.width = video.videoWidth;
        overlay.height = video.videoHeight;
        
        // Nota: A detecção facial é iniciada automaticamente após a webcam ser conectada
        // na função startWebcam()
        
    } catch (error) {
        console.error('Erro ao iniciar aplicação:', error);
        statusElement.textContent = `Erro ao iniciar aplicação: ${error.message}`;
    }
}

// Função para detectar faces usando a API do Face-API.js via CDN
async function startFaceDetection() {
    try {
        statusElement.textContent = 'Carregando modelos da API...';
        
        // Carregar modelos diretamente da CDN (já incluídos no script)
        await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights'),
            faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights'),
            faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/gh/cgarciagl/face-api.js/weights')
        ]);
        
        statusElement.textContent = 'Detecção facial e expressões ativadas!';
        
        // Configurar detecção
        const options = new faceapi.TinyFaceDetectorOptions({
            inputSize: 512,
            scoreThreshold: 0.5
        });

        // Loop de detecção
        const detectAndDraw = async () => {
            // Detectar faces com landmarks e expressões
            const detections = await faceapi.detectAllFaces(video, options)
                .withFaceLandmarks()
                .withFaceExpressions();

            // Limpar o canvas
            ctx.clearRect(0, 0, overlay.width, overlay.height);

            // Redimensionar detecções para o tamanho do canvas
            const resizedDetections = faceapi.resizeResults(detections, {
                width: overlay.width,
                height: overlay.height
            });

            // Desenhar caixas e landmarks
            faceapi.draw.drawDetections(ctx, resizedDetections);
            faceapi.draw.drawFaceLandmarks(ctx, resizedDetections);
            
            // Atualizar barras de expressão para a primeira face detectada
            if (resizedDetections.length > 0) {
                updateExpressionBars(resizedDetections[0].expressions);
            }

            // Continuar o loop
            requestAnimationFrame(detectAndDraw);
        };

        detectAndDraw();
    } catch (error) {
        console.error('Erro ao iniciar detecção facial:', error);
        statusElement.textContent = `Erro ao iniciar detecção facial: ${error.message}`;
    }
}

// Função para atualizar as barras de expressão
function updateExpressionBars(expressions) {
    if (!expressions) return;
    
    // Atualizar cada barra de expressão
    for (const [expression, element] of Object.entries(expressionElements)) {
        if (element && expressions[expression] !== undefined) {
            const value = expressions[expression] * 100;
            element.style.width = `${value}%`;
        }
    }
}

// Verificar se a API Face-API.js está disponível
async function checkApiAvailability() {
    try {
        // Verificar se a API Face-API.js está disponível
        if (typeof faceapi === 'undefined') {
            console.log('Face-API.js não encontrada');
            statusElement.textContent = 'API de reconhecimento facial não disponível. Verifique sua conexão com a internet e recarregue a página.';
            return false;
        }
        return true;
    } catch (error) {
        console.log('Erro ao verificar API:', error);
        statusElement.textContent = 'Erro ao verificar API. Verifique sua conexão com a internet e recarregue a página.';
        return false;
    }
}

// Verificar se a webcam está disponível
async function checkWebcamAvailability() {
    try {
        // Verificar se o navegador suporta a API MediaDevices
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            statusElement.textContent = 'Seu navegador não suporta acesso à webcam. Por favor, use um navegador mais recente.';
            return false;
        }
        
        // Verificar se há dispositivos de vídeo disponíveis
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
            statusElement.textContent = 'Nenhuma webcam encontrada. Verifique se sua câmera está conectada corretamente.';
            return false;
        }
        
        // Verificar se já temos permissão para acessar a webcam
        try {
            // Tentar acessar a webcam rapidamente para verificar permissões
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Se chegou aqui, temos permissão
            stream.getTracks().forEach(track => track.stop()); // Liberar a câmera
            return true;
        } catch (permissionError) {
            // Se o erro for de permissão, mostrar o botão
            if (permissionError.name === 'NotAllowedError' || permissionError.name === 'PermissionDeniedError') {
                console.log('Permissão de webcam negada ou não concedida ainda');
                permissionButton.classList.remove('hidden');
                statusElement.textContent = 'Clique no botão "Permitir Acesso à Webcam" para continuar.';
                return false;
            }
            throw permissionError; // Propagar outros erros
        }
    } catch (error) {
        console.error('Erro ao verificar disponibilidade da webcam:', error);
        statusElement.textContent = `Erro ao verificar webcam: ${error.message}`;
        // Mostrar o botão de permissão em caso de erro
        permissionButton.classList.remove('hidden');
        return false;
    }
}

// Função para solicitar permissão de webcam explicitamente
async function requestWebcamPermission() {
    try {
        statusElement.textContent = 'Solicitando acesso à webcam...';
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 },
                height: { ideal: 480 },
                facingMode: 'user'
            }
        });
        
        // Liberar a câmera após obter permissão
        stream.getTracks().forEach(track => track.stop());
        
        // Esconder o botão e iniciar a aplicação
        permissionButton.classList.add('hidden');
        statusElement.textContent = 'Permissão concedida! Iniciando aplicação...';
        
        // Verificar API e iniciar aplicação
        const apiAvailable = await checkApiAvailability();
        if (apiAvailable) {
            startApp(); // Iniciar com reconhecimento facial
        } else {
            startWebcam(); // Iniciar apenas a webcam
        }
        
        return true;
    } catch (error) {
        console.error('Erro ao solicitar permissão de webcam:', error);
        statusElement.textContent = `Erro ao acessar webcam: ${error.message}. Verifique suas configurações de privacidade.`;
        return false;
    }
}

// Adicionar event listener para o botão de permissão
permissionButton.addEventListener('click', requestWebcamPermission);

// Iniciar a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Verificar disponibilidade da webcam
        const webcamAvailable = await checkWebcamAvailability();
        if (!webcamAvailable) {
            // Se a webcam não estiver disponível, não continuar
            return;
        }
        
        // Verificar disponibilidade da API Face-API.js
        const apiAvailable = await checkApiAvailability();
        
        // Se a API estiver disponível, iniciar a aplicação
        if (apiAvailable) {
            startApp();
        } else {
            // Apenas iniciar a webcam sem detecção facial
            startWebcam();
        }
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        statusElement.textContent = `Erro ao inicializar: ${error.message}`;
    }
});