# BusMemeGenerator
Code for the QCA / transport action group bus route meme project

##Project setup

Install [mongodb](https://docs.mongodb.com/manual/installation/) (Make sure you start the mongodb instance)

Run *npm install*

To use the translink API you need to authenticate. NPM looks for env variables to avoid putting creds into the repo. 

Please set the following:

export TL_USER="uSERnAME"
export TL_PASSWORD="pASSwORD"

You are good to go now.

###To start the server

Run *grunt*

###To run tests

Run *grunt test*
