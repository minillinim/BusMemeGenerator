var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && 'mongodb://' + process.env.BM_MONGODB_HOST + '/' + process.env.BM_MONGODB_NAME || 'mongodb://localhost/app-dev'
  },

  test: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && 'mongodb://' + process.env.BM_MONGODB_HOST + '/' + process.env.BM_MONGODB_NAME || 'mongodb://localhost/app-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && 'mongodb://' + process.env.BM_MONGODB_HOST + '/' + process.env.BM_MONGODB_NAME
    
  }
};

module.exports = config[env];
