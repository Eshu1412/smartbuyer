# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI Backend
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r ./backend/requirements.txt uvicorn gunicorn

# Copy backend application
COPY backend/ ./backend/

# Copy compiled static frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8080
ENV PORT=8080
ENV PYTHONPATH=/app/backend

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
