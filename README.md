# BusMemeGenerator
Code for the QCA / transport action group bus route meme project

## Project setup

### Environment

#### No-docker setup

Start MongoDB and the application environments by running this command:

```
mongod
grunt
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
