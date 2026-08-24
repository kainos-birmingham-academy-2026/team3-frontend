FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/src/views ./src/views
COPY --chown=node:node --from=build /app/public ./public

EXPOSE 3000

USER node

CMD ["npm", "start"]