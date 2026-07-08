FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate
RUN npx tsc

COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 3001

CMD ["sh", "entrypoint.sh"]
