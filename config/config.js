var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var mongoUri = 'mongodb://' + process.env.BM_MONGODB_USER + ':' + process.env.BM_MONGODB_PWD + '@' + process.env.BM_MONGODB_HOST + ':' + process.env.BM_MONGODB_PORT + '/' + process.env.BM_MONGODB_NAME;

var config = {
  development: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && mongoUri || 'mongodb://localhost/app-dev'
  },

  test: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && mongoUri || 'mongodb://localhost/app-test'
  },

  production: {
    root: rootPath,
    app: {
      name: 'app'
    },
    port: process.env.PORT || 3000,
    db: process.env.BM_MONGODB_HOST && mongoUri
    
  }
};

module.exports = config[env];
