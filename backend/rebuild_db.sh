#!/bin/sh

rm caps.sqlite
bin/cake migrations migrate -t 20191217155946
sqlite3 caps.sqlite < dump-2020-01.sql 
bin/cake migrations migrate

