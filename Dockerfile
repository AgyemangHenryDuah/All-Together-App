FROM node:20-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

RUN chown -R appuser:appgroup /app


USER appuser

COPY --chown=appuser:appgroup package*.json ./

RUN npm ci --only=production

COPY --chown=appuser:appgroup . .

ENV NODE_ENV=production

ENV PORT=3000


CMD ["npm", "start"]