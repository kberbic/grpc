FROM node:15-alpine as build
RUN apk add bash
WORKDIR /src/app
COPY package*.json ./
COPY . .
RUN npm install --production
EXPOSE 8080, 8081
CMD ["npm","start"]