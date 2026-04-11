# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the frontend ----------
FROM node:22-bookworm-slim AS frontend
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ---------- Stage 2: backend runtime ----------
FROM node:22-bookworm-slim AS runtime
WORKDIR /app

# Install backend dependencies. The project keeps tsx/express/prisma in
# devDependencies, so we must include dev deps even in the runtime image.
COPY backend/package.json backend/package-lock.json ./backend/
RUN cd backend && npm ci --include=dev

# Copy backend source + prisma schema/migrations/config.
COPY backend/ ./backend/

# Environment used by `prisma generate` and the server at runtime.
ENV DATABASE_URL=file:/data/jp-notes.db \
    FRONTEND_DIST=/app/frontend/dist \
    PORT=4000 \
    NODE_ENV=production

# Generate the Prisma client into backend/generated/prisma.
RUN cd backend && npx prisma generate

# Copy the built frontend from stage 1 into the image.
COPY --from=frontend /app/frontend/dist ./frontend/dist

# Persistent SQLite lives here; mount a volume in compose.
RUN mkdir -p /data
VOLUME ["/data"]

EXPOSE 4000

WORKDIR /app/backend
# Run pending migrations, then start the server. `prisma migrate deploy`
# is the production-safe command — it never prompts, only applies.
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
