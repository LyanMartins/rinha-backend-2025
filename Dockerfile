# Imagem base do Node.js
FROM node:20-alpine

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia package.json primeiro (melhora cache das dependências)
COPY package*.json ./

# Instala dependências
RUN npm install
RUN npm install -g nodemon
RUN npm i uws

# Copia o restante do código
COPY . .

# Expõe a porta (caso o app rode em 3000, por exemplo)
EXPOSE 3000

# Comando padrão ao iniciar o container
CMD ["nodemon", "src/index.js"]