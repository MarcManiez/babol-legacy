FROM ubuntu:16.04

ENV UBUNTU_CODENAME="xenial"

LABEL maintainer "Marc Maniez"
RUN apt-get update && apt-get install -y curl
RUN curl --silent https://deb.nodesource.com/gpgkey/nodesource.gpg.key | apt-key add - 
ENV VERSION=node_6.x
RUN echo "deb https://deb.nodesource.com/$VERSION $UBUNTU_CODENAME main" | tee /etc/apt/sources.list.d/nodesource.list
RUN echo "deb-src https://deb.nodesource.com/$VERSION $UBUNTU_CODENAME main" | tee -a /etc/apt/sources.list.d/nodesource.list
RUN apt-get install -y apt-transport-https
RUN apt-get update && apt-get install nodejs
ADD . /babol
WORKDIR /babol
EXPOSE 8000
RUN npm install
CMD cd /babol && ./node_modules/.bin/knex migrate:latest && npm start