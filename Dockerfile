FROM node:10.15.2-alpine

WORKDIR /app

COPY package.json /app
RUN npm cache clean --force && npm install

COPY . /app


ENV PORT 3000
EXPOSE 3000/tcp 34234/tcp

CMD ["npm", "run", "start" ]

