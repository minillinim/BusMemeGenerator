var mongoose = require('mongoose'),
    path = require('path'),
    fs = require('fs'),
    MemeTemplate = mongoose.model('MemeTemplate'),
    Image = mongoose.model('Image'),
    MemeDetails = mongoose.model('MemeDetails');

var defaultMeme = [
    {firstLine: 'Public Transport', secondLine: 'FAIL!!!'},
    {firstLine: 'Logan City Council', secondLine: 'Needs to invest in Public Transport!'},
    {firstLine: 'Public Transport', secondLine: 'Couldnt get much worse...'},
    {firstLine: 'And then you wonder why', secondLine: 'everyone owns a car..'}];

var saveMemeDetails = function (req, res, next) {
    var memeDetails = new MemeDetails(req.body);
    memeDetails.save(function (err) {
        if (err) {
            res.json(err);
        }
        res.status(201).json(req.body);
    });
};

function generateImageFilename() {
    var randomNumber = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (randomNumber + randomNumber + "-" + randomNumber + "-4" + randomNumber.substr(0, 3) + "-" + randomNumber + "-" + randomNumber + randomNumber + randomNumber).toLowerCase();
}

var saveImage = function (req, res, next) {
    var imageLink = generateImageFilename();
    var imageDetails = (JSON.parse(JSON.stringify(req.body))).data;
    imageDetails.imageLink = imageLink;
    imageDetails.createDate = new Date();

    console.log(imageDetails);

    if (imageDetails) {
        var imageFromuser = new Image(imageDetails);
        imageFromuser.save(function (err, image) {
            if (err) {
                res.json(err);
            }
            res.status(201).json({imageLink: imageLink});
        });
    } else {
        res.status(400).json("Bad data");
    }
};

var getMemeTemplates = function (req, res, next) {
    var templates = [];

    MemeTemplate.find().stream().on('data', function (data) {
        templates.push(data);
    }).on('error', function (err) {
        console.log('error', err);
    }).on('close', function () {
        if (templates) {
            if (templates.length < 1) {
                templates = defaultMeme;
            }
        }
        res.json(templates);
    });
};

var getImages = function (req, res, next) {
    var images = [];
    Image.find({}, {'imageUrl': 0}).stream().on('data', function (data) {
        images.push(data);
    }).on('error', function (err) {
        console.log('error', err);
    }).on('close', function () {
        res.json(images);
    });
};

var getImage = function (req, res, next) {
    var imageUrl;
    Image.find({"imageLink": req.params['imageLink']}).stream().on('data', function(data) {
        imageUrl = data.imageUrl;
    }).on('close', function() {
        res.setHeader("Content-type", "image/png");
        res.send(new Buffer(imageUrl.replace(/^data:image\/png;base64,/, ''), 'base64'));
    });
};

module.exports = function () {
    return {
        getMemeTemplates: getMemeTemplates,
        saveMemeDetails: saveMemeDetails,
        saveImage: saveImage,
        serveImage: getImage,
        getImages: getImages
    }
};