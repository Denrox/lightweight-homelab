FROM node:22.16.0-alpine3.22

RUN mkdir -p /application

COPY ./package*.json /application/
COPY build /application/build/
WORKDIR /application
RUN npm ci --omit=dev
CMD ["npm", "run", "start"]
