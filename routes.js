var q = require('q');
var exec = q.nfbind(require('child_process').exec);
var clarafai_tools = require('./clarifai_tools');
var request = require('request');

function chunkVideo(name) {
    var command =
            `ffmpeg -i videos/${name}/${name}.mp4 -acodec copy -f segment -segment_time 10 -vcodec copy -reset_timestamps 1 -map 0 -an videos/${name}/${name}%d.mp4`;
    console.log(command);
    return exec(command);
};

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

exports.downloadYouTubeVideo = function(req, res) {
    var yt_id = req.params.youtube_url;
    var youtube_url = 'https://www.youtube.com/watch?v=' + yt_id;
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

        return q.all([
            getVideoMetaData(yt_id),
            clarafai_tools.tagVideo('1GWMvCXdsG4', 0)
        ]);

    }).then(function(results) {
        console.log(results[0]);
        console.log(results[1]);

        // I'm getting rich
        res.status(200).send();

    }).catch(function(err) {
        console.log(err.stack);

        // Bad stuff, give us an error
        res.status(401).send();

    });
};

exports.home = function(req, res) {
    res.render('index', {
        testing: 'metro boomin'
    });
};
