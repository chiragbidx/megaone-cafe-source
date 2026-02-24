FROM node:20-alpine

WORKDIR /app

# Minimal deps for git + openssh (fetch) and ca-certs for HTTPS
RUN apk add --no-cache git openssh ca-certificates

# Copy only what we need for runtime (no build step)
COPY . .

EXPOSE 8080

CMD ["node", "scripts/static-supervisor.js"]
