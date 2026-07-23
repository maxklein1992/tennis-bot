########## Stage 1: frontend build ##########
FROM node:22-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

########## Stage 2: backend build ##########
FROM node:22-slim AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend ./
RUN npx prisma generate
RUN npm run build

########## Stage 3: runtime ##########
FROM node:22-slim AS runtime
WORKDIR /app
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev
COPY --from=backend-builder /app/backend/prisma ./prisma
COPY --from=backend-builder /app/backend/dist ./dist
RUN npx prisma generate
COPY --from=frontend-builder /app/frontend/dist ./public

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
