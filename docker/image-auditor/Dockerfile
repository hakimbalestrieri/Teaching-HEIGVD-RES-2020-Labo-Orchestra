FROM node:16

COPY src /opt/app/

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/auditor.js"]
