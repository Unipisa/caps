# To build the image:
#
# $ VERSION=$( node -e "console.log(require('./api/package.json').version)" )
# $ docker build . -t paolini/caps:$VERSION
# $ docker tag paolini/caps:$VERSION paolini/caps:latest
#
# To run the image:
# $ docker-compose -f docker-compose-production.yml up
#
# To push the image:
# $ docker push paolini/caps

FROM node

#RUN apt-get update && apt-get install -y \
#	python \
#    && rm -rf /var/lib/apt/lists/*

COPY api /api
COPY frontend /frontend

RUN cd /frontend && npm ci

RUN cd /frontend && npm run js

RUN cd /api && npm ci

RUN npm install -g ts-node

WORKDIR /api

EXPOSE 3000

CMD './index.ts'

