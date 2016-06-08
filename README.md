# BusMemeGenerator
Code for the QCA / transport action group bus route meme project

## Project setup

### Development

#### No-docker setup

Start MongoDB/Node server and the application environments by running this command:

```
mongod
BM_ADMIN_TOKEN=test grunt
```

#### Docker setup

To avoid port conflicts, make sure that:
* no local Mongo DB is *not* running
* no BusMeme containers are already running (`docker ps`)

Start MongoDB and the application environments by running this command:
```
docker-compose up
```

Code watch:

```
docker exec -it busmemegenerator_web_1 bash
root@5acabb66d9f6:/app# cd /app
root@5acabb66d9f6:/app# ./node_modules/.bin/grunt
```

Mongo client (for db queries): 
```
docker exec -it busmemegenerator_db_1 bash
root@221d3a2b4173:/# mongo
```

Application models: [ "Image", "MemeTemplate", "User" ]
Useful commands: `use [MY-DB-NAME]`, `db.getCollectionNames()`, `db.[MY-COLLECTION].find({})`, `db.[MY-COLLECTION].drop({})`

### Production

#### Facebook integration

Create 2 applications:
- BusMemeGenerator: make sure the "Site URL" matches the production website URL (e.g. `http://busmeme.org`)
- BusMemeGeneratorQA, which is a test app (see here what's a FB test app here: https://developers.facebook.com/docs/apps/test-apps/): make sure the "Site URL" matches the QA website URL (e.g. `http://bus-meme-generator.herokuapp.com`)

#### Docker installation

```
apt-get update
apt-get install apt-transport-https ca-certificates
apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D
apt-get update
apt-get purge lxc-docker
apt-get install docker-engine
```

Change `/etc/default/docker`

```
DOCKER_OPTS="-H tcp://127.0.0.1:4243 -H unix:///var/run/docker.sock"
```

Restart docker:

```
service docker restart
```

#### Database / Application

```
export DOCKER_HOST=tcp://localhost:4243
mkdir -p /var/lib/busmemegenerator_db/data
docker run -d --name db -v /var/lib/busmemegenerator_db/data:/data/db mongo
wget https://raw.githubusercontent.com/minillinim/BusMemeGenerator/master/app.env
docker pull minillinim/busmemegenerator
docker run -d --link db:db -p 80:80 --env-file ./app.env --name busm-app minillinim/busmemegenerator
```

If needed, edit `app.env` to change defaut port / database URI / Node environment
