FROM php:8.1-apache

RUN apt-get update && apt-get install -y \
        libfreetype6-dev \
        libjpeg62-turbo-dev \
        libpng-dev \
	libldap2-dev \
	libsasl2-dev \
        libicu-dev \
        libpq-dev \
        wget \
        ssh \
        libcurl4-openssl-dev \
	libzip-dev \
        postgresql-client \
	sudo \
        python3 \
	python \
    && rm -rf /var/lib/apt/lists/* \
    && php -r "copy('https://getcomposer.org/installer', '/tmp/composer-setup.php');" \
    && php /tmp/composer-setup.php --install-dir=/usr/local/bin \
    && docker-php-ext-install gd ldap pdo_mysql intl zip curl opcache pdo_pgsql

ENV NODE_VERSION=16.13.0
ENV PATH="/node-v${NODE_VERSION}-linux-x64/bin:${PATH}"

RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
	&& sed -i "s|session.gc_maxlifetime = .*|session.gc_maxlifetime = 86400|g" "$PHP_INI_DIR/php.ini"

COPY backend /backend
COPY frontend /frontend
COPY ./docker/app.php /backend/config/app.php.template
COPY ./docker/caps-exec /backend/
COPY ./scripts/ssh-tunnel-wrapper.sh /backend/

RUN rm -rf /frontend/node_modules /backend/webroot/css/* /backend/webroot/js/* \
    && wget -q https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz \
    && tar xJf ./node-v${NODE_VERSION}-linux-x64.tar.xz -C / \
    && rm node-v${NODE_VERSION}-linux-x64.tar.xz \
    && cd /backend && php /usr/local/bin/composer.phar install \
    && chown www-data:www-data /backend /frontend /var/www -R \
    && cd /frontend \ 
    && sudo -u www-data env PATH=${PATH} npm ci \ 
    && sudo -u www-data env PATH=${PATH} npm run deploy

# Tune the PHP configuration
RUN sed -i "s/memory_limit = .*/memory_limit = 512M/" /usr/local/etc/php/php.ini

WORKDIR /backend

CMD './caps-exec'

