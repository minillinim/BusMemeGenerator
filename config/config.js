var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var MONGO_URI = 'mongodb://' + process.env.BM_MONGODB_USER + ':' + process.env.BM_MONGODB_PWD + '@' + process.env.BM_MONGODB_HOST + ':' + process.env.BM_MONGODB_PORT + '/' + process.env.BM_MONGODB_NAME;

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && MONGO_URI || 'mongodb://localhost/app-dev'
  },

  test: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && MONGO_URI || 'mongodb://localhost/app-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && MONGO_URI
    
  }
};

module.exports = config[env];
