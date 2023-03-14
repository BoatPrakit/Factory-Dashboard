FROM node:14.17.6-alpine3.13
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Bangkok /etc/localtime && \
    echo "Asia/Bangkok" > /etc/timezone
WORKDIR /app
COPY . .
RUN npm install && npx prisma generate
RUN npm run build
CMD npx prisma migrate deploy && npm run start:prod