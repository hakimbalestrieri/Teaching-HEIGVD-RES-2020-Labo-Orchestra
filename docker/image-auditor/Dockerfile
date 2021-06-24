FROM node:16

COPY src /opt/app/

RUN apt-get update && \
    apt-get install -y vim tcpdump

WORKDIR /opt/app/
RUN npm install

EXPOSE 2205

ENTRYPOINT ["node", "/opt/app/auditor.js"]
