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

# Upgrade Alpine packages to install patched libcrypto3 and libssl3 versions.
RUN apk upgrade --no-cache

# Upgrade npm to replace its vulnerable bundled tar, brace-expansion, ip-address, and undici packages.
RUN npm install --global npm@12.0.2

# Install only production dependencies, then remove cached package archives from the runtime image.
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/src/views ./src/views
COPY --chown=node:node --from=build /app/public ./public

EXPOSE 3000

USER node

CMD ["npm", "start"]