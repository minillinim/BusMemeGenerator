#!/usr/bin/env bash
apt-get update
apt-get install apt-transport-https ca-certificates
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
apt-get update
apt-get purge lxc-docker
apt-get install docker-engine
service docker start
restart docker
apt-get -y install python-pip

docker run -d --name busmemegenerator_db mongo
docker run -d --link busmemegenerator_db:busmemegenerator_db -p 80:80 --env-file /home/dhc-user/BusMemeGenerator/app.env  busmemegenerator_web
