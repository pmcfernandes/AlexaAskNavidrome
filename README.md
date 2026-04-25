# Alexa Navidrome Player Skill

Este projecto é um servidor backend em Node.js e Express concebido para funcionar como uma skill da Amazon Alexa. Permite controlar a reprodução de músicas alojadas no seu servidor Navidrome (via a API Subsonic) utilizando comandos de voz em português.

## Funcionalidades

- **Reproduzir uma música específica:** Ex.: "Alexa, pede ao player de músicas locais para tocar Hotel California."
- **Reproduzir uma música aleatória:** Ex.: "Alexa, pede ao player de músicas locais para tocar uma música aleatória."
- **Reproduzir uma música aleatória de um artista:** Ex.: "Alexa, pede ao player de músicas locais para tocar uma música aleatória dos The Beatles."
- **Proxy de áudio seguro:** O servidor actua como proxy. Em vez da Alexa autenticar directamente na sua biblioteca, o servidor gera chaves temporárias e encaminha apenas o fluxo de áudio anonimizado para os dispositivos da Amazon.

## Como instalar e executar

### Pré-requisitos

- Node.js (recomendado v18 ou superior).
- Conta no Alexa Developer Console: https://developer.amazon.com/alexa/console/ask
- Um servidor Navidrome em funcionamento (com as portas necessárias acessíveis se não estiver na mesma rede).

### 1. Preparar o ambiente

Clone este repositório, instale as dependências e configure as variáveis de ambiente:

```bash
# Instalar dependências
npm install

# Copiar o ficheiro de exemplo
cp .env.example .env
```

### 2. Configurar o `.env`

Edite o ficheiro `.env` com os valores adequados ao seu sistema:

```env
NAVIDROME_URL=http://127.0.0.1:4533
NAVIDROME_USER=admin
NAVIDROME_PASS=password
PUBLIC_SERVER_URL=https://o-seu-tunel-ngrok.example
PORT=3000
```

Nota: a variável `PUBLIC_SERVER_URL` deve apontar para um URL HTTPS público (por exemplo, um túnel Ngrok ou um proxy reverso) pelo qual a Alexa conseguirá aceder aos streams.

### 3. Executar o servidor

```bash
npm run start
```

O servidor irá registar no console a porta onde está a escutar (por defeito, `3000`).

## Configurar a Skill na Alexa

1. No Alexa Developer Console, crie uma nova Skill do tipo "Custom".
2. Em **Interaction Model > JSON Editor**, cole o conteúdo de `models/pt-BR.json` e clique em **Build Model**.
3. Em **Endpoint**, defina o URL público HTTPS do endpoint do servidor (ex.: `https://o-seu-tunel.example/skill`).
4. Em **Interfaces**, active a interface **Audio Player** para suportar streams contínuos em MP3.

## Sobre autenticação (API Subsonic)

Para proteger as credenciais, a skill evita enviar a sua palavra-passe em texto simples. O servidor processa a autenticação localmente, gerando sal e hash temporários (por exemplo, `salt + MD5`) por cada pedido, minimizando a exposição das credenciais.
