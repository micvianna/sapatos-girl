FROM node:22-alpine AS dependencies

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev \
    && npm cache clean --force


RUN npm install -g npm@latest


FROM node:22-alpine AS runtime

WORKDIR /app


ENV NODE_ENV=production
ENV PORT=5000

COPY --from=dependencies /app/node_modules ./node_modules
COPY src ./src
COPY package*.json ./

RUN rm -rf /usr/local/lib/node_modules/npm
EXPOSE 5000

USER node

CMD ["npm", "src/server.js"]