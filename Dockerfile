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

# Install production dependencies, then remove npm and its vulnerable bundled packages from runtime.
RUN npm ci --omit=dev \
	&& npm cache clean --force \
	&& rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

COPY --chown=node:node --from=build /app/dist ./dist
COPY --chown=node:node --from=build /app/src/views ./src/views
COPY --chown=node:node --from=build /app/public ./public

EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]