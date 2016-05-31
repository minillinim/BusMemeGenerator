var mongoose = require('mongoose'),
    fs = require('fs'),
    MemeTemplate = mongoose.model('MemeTemplate'),
    MemeDetails = mongoose.model('MemeDetails');

var defaultMeme = [
    {firstLine: 'Public Transport', secondLine: 'FAIL!!!'},
    {firstLine: 'Logan City Council', secondLine: 'Needs to invest in Public Transport!'},
    {firstLine: 'Public Transport', secondLine: 'Couldnt get much worse...'},
    {firstLine: 'And then you wonder why', secondLine: 'everyone owns a car..'}];

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

var saveMemeDetails = function (req, res, next) {
    var memeDetails = new MemeDetails(req.body);
    memeDetails.save(function (err) {
        if (err) {
            res.json(err);
        }
        return res.status(201).json(req.body);
    });
};

function createGalleryDirectory(filePath) {
    var dir = './gallery';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    var fd = fs.openSync('./gallery/' + filePath, 'w');
}

var saveImage = function (req, res, next) {
    console.log(req.body);
    createGalleryDirectory('test.JPG');
    fs.writeFile("test.JPG", req.body, 'binary', function (err) {
        if (err) {
            console.log(err);
            res.send(err);
        }
        res.send('The file was saved');
    });
};

module.exports = function () {
    return {
        getMemeTemplates: getMemeTemplates,
        saveMemeDetails: saveMemeDetails,
        saveImage: saveImage
    }
};