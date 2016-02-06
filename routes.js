var q = require('q');
var exec = q.nfbind(require('child_process').exec);
var clarafai_tools = require('./clarifai_tools');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');

function chunkVideo(name) {
    var command =
            `ffmpeg -i videos/${name}/${name}.mp4 -vf fps=10/60 videos/${name}/${name}%d.jpg`;
    console.log(command);
    return exec(command);
};

// function chunkVideo(name) {
//     var command =
//         `ffmpeg -i videos/${name}/${name}.mp4 -acodec copy -f segment -segment_time 10 -vcodec copy -reset_timestamps 1 -map 0 -an videos/${name}/${name}%d.mp4`;
//     console.log(command);
//     return exec(command);
// };

// function makeThumb(name) {
//     var command =
//         `ffmpeg -y -ss 0.5 -i videos/${name}/${name}.mp4 -vframes 1 -s 500x500 -f image2 videos/${name}/${name}.jpg`;
//     console.log(command);
//     return exec(command);
// }

function getVideoMetaData(id) {
    var defer = q.defer();
    var url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&part=snippet&key=${process.env.YOUTUBE_API_KEY}`;
    request(url, function(err, response, body) {
        if (err)
            defer.reject(err);
        else
            defer.resolve(body);
    });

    return defer.promise;
}

function generateVideoLyrics(body, yt_id) {
    // clarafai_tools.tagVideo('1GWMvCXdsG4', 0)
    var defer = q.defer();
    var files = fs.readdirSync('videos/' + yt_id);
    console.log('Files:', files);
    files = _.filter(files, file => { return file.endsWith(".jpg"); });
    console.log('Files:', files);
    var chunks = files.length - 1;
    var curChunk = 0;

    function readNext() {
        processSingleChunk(yt_id, curChunk, body)
            .then(successHandler)
            .catch(failureHandler);
    }

    function successHandler() {
        curChunk += 1;
        if (curChunk < chunks) {
            readNext();
        } else {
            defer.resolve();
        }
    }

    function failureHandler(err) {
        defer.reject(err);
        console.log(err);
    }

    readNext();

    return defer.promise;
}

function processSingleChunk(yt_id, chunk, body) {
    var defer = q.defer();

    clarafai_tools.tagVideo(yt_id, chunk).then(function(res) {
        console.log(res.results[0].result.tag.classes[0]);
        defer.resolve(res.results[0].result.tag.classes[0]);
    });

    return defer.promise;
}

exports.downloadYouTubeVideo = function(req, res) {
    var yt_id = req.params.youtube_url;
    var youtube_url = 'https://www.youtube.com/watch?v=' + yt_id;
    var video_info;
    console.log(yt_id);

    var command = 'youtube-dl --id -f "mp4" ' + youtube_url;
    return exec(command).then(function(streams) {
        console.log(streams[0]);
        // Make the directory
        var mkdir = 'mkdir -p ' + process.env.PWD + '/videos/' + yt_id;

        return exec(mkdir);

    }).then(function(streams) {
        console.log(streams[0]);
        // Move the video
        var mv = 'mv ' + process.env.PWD + '/' + yt_id + '.mp4 ' + 'videos/' + yt_id;

        return exec(mv);

    }).then(function(streams) {
        console.log(streams[0]);

        // Chunk that video!
        return chunkVideo(yt_id);

    }).then(function(streams) {
        console.log(streams[0]);

        return getVideoMetaData(yt_id);

    }).then(function(body) {
        console.log("GENERATE SOME LYRICS");
        generateVideoLyrics(body, yt_id);

        // I'm getting rich
        res.status(200).send();

    }).catch(function(err) {
        console.log(err);

        // Bad stuff, give us an error
        res.status(401).send();

    });
};

exports.home = function(req, res) {
    res.render('index', {
        testing: 'metro boomin'
    });
};
