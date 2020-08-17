FROM ubuntu:18.04

ENV LIBINDY_VERSION 1.15.0-bionic

RUN apt-get update && \
    apt-get install -y \
    apt-transport-https \
    build-essential \
    curl \
    iproute2 \
    jq \
    software-properties-common \
    unzip \
    vim

# Setup apt for Sovrin repository
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68DB5E88 && \
    add-apt-repository "deb https://repo.sovrin.org/sdk/deb bionic stable"

# Install libindy library from Sovrin repo
RUN apt-get update && apt-get install -y \
    libindy=${LIBINDY_VERSION}

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && \
    apt-get install -y nodejs

# Bundle app source
COPY . /src

# Install app dependencies
WORKDIR /src

RUN npm install 2>/dev/null

CMD ["node", "/src/app.js"]
