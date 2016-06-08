var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    MemeTemplate = mongoose.model('MemeTemplate'),
    Image = mongoose.model('Image')
    ;

var exportUsers = function (req, res) {
    var users = [];
    User.find({}, {}).stream().on('data', function (data) {
        users.push(data.fullName + ";" + data.email);
    }).on('error', function (err) {
        console.debug(err);
    }).on('close', function () {
        res.set('Content-Type', 'text/csv');
        res.status(200).send(users.join("\n"));
    });
};

var exportMemeTemplates = function (req, res) {
    var templates = [];
    MemeTemplate.find({}, {}).stream().on('data', function (data) {
        templates.push(data.firstLine + ";" + data.secondLine);
    }).on('error', function (err) {
        console.debug(err);
    }).on('close', function () {
        res.set('Content-Type', 'text/csv');
        res.status(200).send(templates.join("\n"));
    });
};

var exportImages = function (req, res) {
    var images = ['otherMode;otherModeTravelTime;otherModeTravelDistance;publicModeTravelTime;publicModeTravelDistance;imageLink'];
    Image.find({}, {}).stream().on('data', function (data) {
        images.push(data.otherMode + ";" +
                    data.otherModeTravelTime + ";" +
                    data.otherModeTravelDistance + ";" +
                    data.publicModeTravelTime + ";" +
                    data.publicModeTravelDistance + ";" +
                    data.imageLink + ";"
        );
    }).on('error', function (err) {
        console.debug(err);
    }).on('close', function () {
        res.set('Content-Type', 'text/csv');
        res.status(200).send(images.join("\n"));
    });
};

module.exports = function () {
    return {
        exportUsers: exportUsers,
        exportImages: exportImages,
        exportMemeTemplates: exportMemeTemplates
    }
};
