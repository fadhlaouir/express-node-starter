FROM node:24-alpine

ENV NODE_ENV=production
WORKDIR /app

# Install production dependencies only. Husky's prepare script is a dev tool.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

COPY server.js ./
COPY src ./src

# Run as the unprivileged node user; uploads need a writable folder.
RUN mkdir -p uploads && chown node:node uploads
USER node

EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:5000/health || exit 1
CMD ["node", "server.js"]
