# Docker image for CAPS

This folder contains a possible ```docker-compose``` setup for CAPS. To use it, 
you need to copy the file ```caps.env.template``` to ```caps.env```, and customize
the fields.

To start the container, you can run 
```bash
sudo docker-compose up
```

## HTTPS reverse proxies

When CAPS is published through an HTTPS reverse proxy, set its public URL in
`caps.env` so that CakePHP generates HTTPS redirects and absolute links:

```env
APP_FULL_BASE_URL=https://caps.example.org
```

Replace `caps.example.org` with the public hostname, without a trailing slash.
The reverse proxy should also preserve the original host and scheme. For
example, with nginx:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Port $server_port;
```

Restart the CAPS container after changing `caps.env`. Existing installations
should also clear CakePHP's cache with `bin/cake cache clear_all`.

For later updates, use
```bash
sudo docker-compose up --build
```
to regenerate the CAPS image. This will copy the files from the ```backend```
folder into the image. 

## Local development

An alternative ```docker-compose-dev.yml``` file is provided that mounts some directories
directly from the repository, to allow for automatic reloading of the PHP source files
during development. 

A script that automatically builds the image and run the container together with 
automatic regeneration of JS and CSS files is provided as ```start-dev-server.sh```.
If you wish to customize the configuration, you can edit ```docker/caps.env```. Otherwise, 
an LDAP server with users ```user1``` and ```user2``` with their username as
passwords is created. In that case, you may wish to make one of the two an
administrator by running 
```bash
$ sudo docker exec -it caps /backend/bin/cake grant-admin user1
```
once the Docker containers are running. 

The configuration can also be used manually 
running
```bash
sudo docker-compose -f docker-compose-dev.yml up
```
Notice that files in config are not exported, if you change those you will need to 
run ```docker-compose build``` again. 

## LDAP SSH tunnel

The image is set up for automatic SSH forwarding of LDAP server that are not
publicly accessible, for development. In this case, you may set the variable 
```CAPS_SSH_TUNNEL``` in ```caps.env```, and make sure that a private RSA key
is available at ```/backend/id_rsa``` inside the container. For instance, it suffices
to have:
```
  volumes:
    - ./id_rsa:/backend/id_rsa
```
inside the container named ```caps```. 
