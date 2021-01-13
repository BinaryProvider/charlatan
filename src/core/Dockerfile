FROM node:12-alpine as BUILD
WORKDIR /usr/src/app
COPY . . 
RUN npm install
RUN npm run build

FROM node:12-alpine
WORKDIR /usr/src/app
COPY package.json ./
COPY tsconfig.json ./
RUN npm install
COPY --from=BUILD /usr/src/app/dist ./dist
EXPOSE 3000

CMD [ "npm", "run", "start" ]