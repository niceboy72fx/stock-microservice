FROM node:18-alpine
COPY src /app
WORKDIR /app
RUN npm install -g pm2
RUN yarn install
RUN yarn build
CMD ["pm2-runtime", "ecosystem.config.js"]