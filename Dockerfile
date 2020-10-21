FROM php:7.4-apache

RUN apt-get update && apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
	libldap2-dev \
	libsasl2-dev \
        libicu-dev \
        mariadb-client \
        wget \
        ssh \
	npm \
    && rm -rf /var/lib/apt/lists/* \
    && docker-php-ext-install gd ldap pdo_mysql intl

COPY app /app
COPY html /html
COPY ./docker/app.php /app/config/app.php.template
COPY ./docker/caps-exec /app/
COPY ./scripts/ssh-tunnel-wrapper.sh /app/

RUN chown www-data:www-data /app -R && rm -rf /html/node_modules && npm install npm@latest -g

WORKDIR /app

CMD './caps-exec'
