FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG BUILD_CONFIGURATION=production
ARG ADMIN_API_BASE_URL=
ARG ADMIN_API_PREFIX=api
ARG ADMIN_API_VERSION=v1.1
ARG ADMIN_API_SEGMENT=admin

RUN cat > /app/public/runtime-config.js <<EOF
window.__BLIPZO_CONFIG__ = {
  apiBaseUrl: '${ADMIN_API_BASE_URL}',
  apiPrefix: '${ADMIN_API_PREFIX}',
  apiVersion: '${ADMIN_API_VERSION}',
  adminApiSegment: '${ADMIN_API_SEGMENT}',
};
EOF

RUN npm run build -- --configuration ${BUILD_CONFIGURATION}

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/blipzo-admin/browser /usr/share/nginx/html

EXPOSE 80
