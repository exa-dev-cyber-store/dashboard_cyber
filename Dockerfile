FROM node:22-alpine AS build

ARG VITE_BASE_URL=https://be-apple-store.eka-dev.cloud
ARG VITE_STOREFRONT_URL=https://apple-store.eka-dev.cloud

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ENV VITE_BASE_URL=$VITE_BASE_URL
ENV VITE_STOREFRONT_URL=$VITE_STOREFRONT_URL

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
