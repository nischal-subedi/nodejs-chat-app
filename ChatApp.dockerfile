FROM node:lts-bullseye-slim

#CREATING APP DIRECTORY
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm audit fix

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]