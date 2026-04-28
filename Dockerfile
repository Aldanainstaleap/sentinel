# Build stage
FROM public.ecr.aws/docker/library/node:22 AS builder
WORKDIR /var/www
COPY . /var/www
RUN --mount=type=secret,id=npmtoken,target=/run/secrets/npmtoken \
  export NPM_TOKEN=$(cat /run/secrets/npmtoken) && npm ci && npm run build

# Remove development dependencies to reduce image size
RUN npm prune --production

# Run stage
FROM public.ecr.aws/docker/library/node:22
WORKDIR /var/www
COPY --from=builder /var/www/dist /var/www/dist
COPY --from=builder /var/www/node_modules /var/www/node_modules
COPY package.json /var/www
COPY run.sh /var/www


EXPOSE 8080
EXPOSE 80

# Start the application
CMD ["node", "dist/app.js"]