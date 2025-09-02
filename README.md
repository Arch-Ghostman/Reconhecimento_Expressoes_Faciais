# Aplicação de Reconhecimento de Expressões Faciais

Esta aplicação web utiliza JavaScript e a biblioteca Face-API.js para acessar a webcam do usuário e realizar reconhecimento de expressões faciais em tempo real.

## Funcionalidades

- Acesso à webcam do usuário
- Detecção facial em tempo real
- Reconhecimento de expressões faciais (feliz, triste, bravo, surpreso, neutro)
- Visualização das probabilidades de cada expressão

## Como usar

1. Clone este repositório
2. Baixe os modelos da Face-API.js (instruções abaixo)
3. Inicie um servidor web local
4. Acesse a aplicação pelo navegador

## Baixando os modelos

A aplicação precisa dos modelos da Face-API.js para funcionar. Siga os passos abaixo para baixá-los:

1. Crie uma pasta chamada `models` na raiz do projeto
2. Baixe os seguintes arquivos do repositório oficial da Face-API.js (https://github.com/justadudewhohacks/face-api.js/tree/master/weights) e coloque-os na pasta `models`:
   - `tiny_face_detector_model-weights_manifest.json`
   - `tiny_face_detector_model-shard1`
   - `face_landmark_68_model-weights_manifest.json`
   - `face_landmark_68_model-shard1`
   - `face_recognition_model-weights_manifest.json`
   - `face_recognition_model-shard1`
   - `face_recognition_model-shard2`
   - `face_expression_model-weights_manifest.json`
   - `face_expression_model-shard1`

## Iniciando um servidor local

Você pode usar qualquer servidor web local. Aqui estão algumas opções:

### Usando Python

```
python -m http.server
```

### Usando Node.js (com http-server)

```
npm install -g http-server
http-server
```

## Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript
- Face-API.js (baseada em TensorFlow.js)
- API MediaDevices (getUserMedia)

## Observações

- A aplicação requer permissão para acessar a webcam
- Funciona melhor em navegadores modernos (Chrome, Firefox, Edge)
- Requer conexão com a internet para carregar a biblioteca Face-API.js via CDN