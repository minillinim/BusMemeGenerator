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

function createGalleryDirectory(filePath) {
    var dir = './gallery';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
}

var saveImageToFile = function (data, filename) {
    createGalleryDirectory(filename);
    fs.writeFile('./gallery/' + filename + '.png', data.replace(/^data:image\/png;base64,/, ''), 'base64', function (err) {
        if (err) {
            console.log(err);
        }
        console.log('The file was saved');
    });
};

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

            console.log(imageDetails.imageUrl, imageLink);
            saveImageToFile(imageDetails.imageUrl, imageLink);
            res.status(201).json({imageLink: imageLink});
        });
    } else {
        res.status(400).json("Bad data");
    }
}

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
        console.log('images', data);
        images.push(data);
    }).on('error', function (err) {
        console.log('error', err);
    }).on('close', function () {
        res.json(images);
    });
}

var getImage = function (req, res, next) {
    res.sendFile(path.join(__dirname, '../../gallery/' + req.params['imageLink'] + '.png'));
}

module.exports = function () {
    return {
        getMemeTemplates: getMemeTemplates,
        saveMemeDetails: saveMemeDetails,
        saveImage: saveImage,
        serveImage: getImage,
        getImages: getImages,
    }
};