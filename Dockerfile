# Stage 1: build the static site
FROM node:22-alpine AS build
WORKDIR /app
# Copy the dependency lists first, so this layer stays cached
# until the dependencies really change (see Level 4).
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve the built files with nginx. Node is not in the final image.
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
