FROM node:16

COPY src /opt/app/

RUN apt-get update && \
    apt-get install -y vim
	
WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/musician.js"]
