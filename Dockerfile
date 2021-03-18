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
	git \
        libcurl4-openssl-dev \
	libzip-dev \
	sudo \
    && rm -rf /var/lib/apt/lists/* \
    && php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');" \
    && php /tmp/composer-setup.php --install-dir=/usr/local/bin \
    && docker-php-ext-install gd ldap pdo_mysql intl zip curl

COPY app /app
COPY html /html
COPY ./docker/app.php /app/config/app.php.template
COPY ./docker/caps-exec /app/
COPY ./scripts/ssh-tunnel-wrapper.sh /app/

RUN rm -rf /html/node_modules /app/webroot/css/* /app/webroot/js/* \
    && npm install npm@latest -g \
    && cd /app && php /usr/local/bin/composer.phar install \
    && chown www-data:www-data /app /html /var/www -R \
    && cd /html && sudo -u www-data npm install && sudo -u www-data npm run deploy

WORKDIR /app

CMD './caps-exec'
