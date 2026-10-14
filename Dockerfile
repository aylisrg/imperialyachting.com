# syntax=docker/dockerfile:1
# Self-hosted production image for imperialyachting.com (Next.js standalone).
#
# Build (NEXT_PUBLIC_* are inlined into the client bundle, so they are build args):
#   docker build \
#     --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
#     --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
#     --build-arg NEXT_PUBLIC_GOOGLE_MAPS_KEY=... \
#     --build-arg NEXT_PUBLIC_MCP_URL=... \
#     -t imperialyachting .
# Run: server-only secrets go in at runtime (--env-file), never into the image.
#   docker run -p 3000:3000 --env-file .env.production \
#     -v iy-next-cache:/app/.next/cache imperialyachting
# /app/.next/cache holds the next/image optimizer and ISR/fetch cache; mount a
# persistent volume there so it survives redeploys (see docker-compose.yml).

ARG NODE_VERSION=20-bookworm-slim
# Full git SHA of the release (deploy/vps-deploy.sh passes --build-arg GIT_SHA).
ARG GIT_SHA=

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_GOOGLE_MAPS_KEY
ARG NEXT_PUBLIC_MCP_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_GOOGLE_MAPS_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_KEY \
    NEXT_PUBLIC_MCP_URL=$NEXT_PUBLIC_MCP_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
# ARG must be redeclared per stage; /api/health reports it as "commit".
ARG GIT_SHA
ENV GIT_SHA=$GIT_SHA
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
# sharp (next/image AVIF/WebP) is a dependency of next and is traced into the
# standalone node_modules together with its linux-x64 libvips binary.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
# PDFs streamed via fs from process.cwd()/private (documents + sales). They are
# also listed in outputFileTracingIncludes; copied explicitly to be safe.
COPY --from=builder --chown=node:node /app/private ./private
RUN mkdir -p .next/cache && chown -R node:node .next/cache
VOLUME ["/app/.next/cache"]
USER node
EXPOSE 3000
CMD ["node", "server.js"]
