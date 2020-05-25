FROM node:8.17.0

# firebase
RUN npm i -g firebase-tools

WORKDIR /app/functions
RUN npm i -D jest ts-jest @types/jest
RUN npm i -D firebase-admin