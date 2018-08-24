FROM node:4.2.3

MAINTAINER David Gaya

LABEL version="1.0"

LABEL description="Private npm registry based in sinopia"


RUN npm install -g nan@2.2.0
WORKDIR /root/sinopia
RUN git clone https://github.com/fl4re/sinopia.git src
WORKDIR /root/sinopia/src
RUN git checkout OAuth_login
RUN npm install
WORKDIR /root/sinopia

EXPOSE 4873
CMD ["./src/bin/sinopia", "-c", "/data/config/config.yaml", "-l", "0.0.0.0:4873"]

# run with
# docker run -d -v $PWD:/data -p 4873:4873 --name npm_server sinopia
# having a config/config.yaml in your PWD similar to:

# storage: /data/storage
# url_prefix: https://registry.starbreeze.com

# auth:
#   memory: true
# github:
#   organization: fl4re
#   application_name: sinopia
#   client_id: 1234123412341234
#   client_secret: 124bcd1234abcd124bcd1234abcd124bcd1234abcd
#   login_url: 'https://github.com/login/oauth/authorize'

# uplinks:
#   npmjs:
#     url: https://registry.npmjs.org/

# packages:
#   '@*/*':
#     access: $authenticated
#     publish: $authenticated

#   '*':
#     access: $authenticated
#     publish: $authenticated
#     proxy: npmjs

# logs:
#   - {type: stdout, format: pretty, level: debug}
#   - {type: file, path: /data/log/sinopia.log, level: info}
