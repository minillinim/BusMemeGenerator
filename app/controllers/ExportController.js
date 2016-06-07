var mongoose = require('mongoose'),
    User = mongoose.model('User');

var exportUsers = function (req, res, next) {

    var users = [];
    User.find({}, {}).stream().on('data', function (data) {
        users.push(data);
    }).on('error', function (err) {
        console.log('error', err);
    }).on('close', function () {
        res.json(users);
    });
};

module.exports = function () {
    return {
        exportUsers: exportUsers
    }
};
