var q = require('q');
var exec = q.nfbind(require('child_process').exec);

exports.chunkVideo = function(req, res) {
    var name = "darude_sandstorm";
    var command = 'ffmpeg -i videos/' + name + '/' + name + '.mp4 -acodec copy -f segment -segment_time 10 -vcodec copy -reset_timestamps 1 -map 0 -an videos/' + name + '/' + name + '%d.mp4';
    console.log(command);
    var child = exec(command, function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
        }
    });
    res.status(200).send();
};

exports.downloadYouTubeVideo = function(req, res) {
    var yt_id = req.params.youtube_url;
    var youtube_url = 'https://www.youtube.com/watch?v=' + yt_id;
    console.log(yt_id);

    var command = 'youtube-dl --id -f "mp4" ' + youtube_url;
    return exec(command).then(function(streams) {
        console.log(streams[0]);
        // Make the directory
        var mkdir = 'mkdir ' + process.env.PWD + '/' + yt_id;
        return exec(mkdir);
    }).then(function(streams) {
        console.log(streams[0]);
        // Move the video
        var mv = 'mv ' + process.env.PWD + yt_id + '.mp4 ' + yt_id;
        return exec(mv);
    }).then(function(streams) {
        console.log(streams[0]);
        // All good buddy!
        res.status(200).send();
    }).catch(function(err) {
        console.log(err);
        // Bad stuff, give us an error
        res.status(401).send();
    });
};
