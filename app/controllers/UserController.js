var mongoose = require('mongoose'),
    User = mongoose.model('User');

var saveUserDetails = function (req, res, next) {
    var user = (JSON.parse(JSON.stringify(req.body))).data;
    var UserDetails = new User(user);
    UserDetails.save(function (err, doc) {
        if (err) {
            res.json(err);
        }
        res.status(201).json(doc);
    });
};


module.exports = function () {
    return {
        saveUserDetails: saveUserDetails
    }
};