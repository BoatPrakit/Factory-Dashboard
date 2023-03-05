FROM node:14.17.6-alpine3.13
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY .env ./
RUN npm install
RUN npx prisma generate

COPY . .
EXPOSE 3000
RUN npm run build
CMD ["npm","run","start:prod"]
