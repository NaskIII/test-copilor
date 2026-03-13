# Stage 1: Build Angular app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist/frontend/browser /usr/share/nginx/html

# Nginx config: proxy /api to backend, serve Angular for all other routes
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
