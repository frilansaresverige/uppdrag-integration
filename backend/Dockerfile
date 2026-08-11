FROM node:24-alpine AS deps

WORKDIR /app

COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --omit=dev


FROM node:24-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S app && adduser -S app -G app

COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend

USER app

EXPOSE 8989

CMD ["node", "backend/src/index.js"]
