var q = require('q');
var exec = q.nfbind(require('child_process').exec);
var clarafai_tools = require('./clarifai_tools');
var request = require('request');
var fs = require('fs');
var _ = require('lodash');
var Sentencer = require('sentencer');
var WordPOS = require('wordpos'),
    wordpos = new WordPOS();
// var db = require('./db');
var templates = require('./templates');
var Video = require('./models/video');
var moment = require('moment');

function chunkVideo(name) {
    var command =
        `ffmpeg -y -i videos/${name}/${name}.mp4 -vf fps=5/60 videos/${name}/${name}%d.jpg`;
    console.log(command);
    return exec(command);
};


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
    files = _.filter(files, file => {
        return file.endsWith(".jpg");
    });
    console.log(body);
    var chunks = files.length;
    var curChunk = 1;
    var lyrics = [];

    function readNext() {
        processSingleChunk(yt_id, curChunk, lyrics)
            .then(successHandler)
            .catch(failureHandler);
    }

    function successHandler() {
        curChunk += 1;
        if (curChunk < chunks) {
            readNext();
        } else {
            var srtString = "WEBVTT - Has some cues \n\n";

            lyrics.forEach(function(lyric, index) {
                srtString += `${index + 1}\n`;
                srtString += `00:${moment(0).seconds(index  * 5).format('mm:ss')}.000 --> 00:${moment(0).seconds((index + 1) * 5).format('mm:ss')}.000\n`;
                srtString += `${lyric}\n`;
                if (lyrics.length != index + 1)
                    srtString += "\n";
            });

            fs.writeFileSync(`videos/${yt_id}/${yt_id}.vtt`, srtString, 'utf8');

            console.log(srtString);

            var video = new Video({
                youtube_id: yt_id,
                title: JSON.parse(body).items[0].snippet.title,
                thumb: JSON.parse(body).items[0].snippet.thumbnails.standard.url,
                lyrics: lyrics
            });

            video.save(function(err, video) {
                if (err)
                    defer.reject(err);
                console.log(video);
                defer.resolve(video);
            });
        }
    }

    function failureHandler(err) {
        defer.reject(err);
        console.log(err);
    }

    readNext();

    return defer.promise;
}

function processSingleChunk(yt_id, chunk, lyrics) {
    var defer = q.defer();

    clarafai_tools.tagVideo(yt_id, chunk).then(function(res) {
        var tags = res.results[0].result.tag.classes.join(' ');
        wordpos.getPOS(tags, function(res) {
            try {
                Sentencer.configure({
                    nounList: res.nouns,
                    adjectiveList: res.adjectives
                });

                var lyric = Sentencer.make(templates[
                    Math.floor(Math.random() * templates.length)
                ]);

                lyrics.push(lyric);

                console.log(lyric);
                defer.resolve(lyric);
            } catch (e) {
                console.log(e);
            }
        });
    }).catch(function(err) {
        defer.reject(err);
    });

    return defer.promise;
}

exports.downloadYouTubeVideo = function(req, res) {
    var yt_id = req.params.youtube_url;
    var youtube_url = 'https://www.youtube.com/watch?v=' + yt_id;
    var video_info;
    console.log(yt_id);

    Video.findOne({
        youtube_id: yt_id
    }, function(err, video) {
        if (err)
            res.status(400).send();
        else if (video) {
            res.status(304);
            res.json(video);
        } else {
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
                return generateVideoLyrics(body, yt_id);

            }).then(function(video) {
                console.log(video);

                // I'm getting rich
                res.status(200);
                res.json(video);

            }).catch(function(err) {
                console.log(err);

                // Bad stuff, give us an error
                res.status(400).send();

            });
        }

    });
};

exports.home = function(req, res) {
    res.render('index', {
        testing: 'metro boomin'
    });
};

exports.getVideos = function(req, res) {
    Video.find({}, {
        youtube_id: true,
        title: true
    }).exec(function(err, videos) {
        res.jsonp(videos);
    });
};

// If none of the fields on req.body are present, this route returns all the
// lyrics
// exports.find_lyrics = function(req, res) {
//     var youtube_id = req.body.youtube_id,
//         title = req.body.title,
//         artist = req.body.artist;
//     db.find(youtube_id, title, artist).then(function(songs) {
//         res.send(songs);
//     }, function(error) {
//         res.status(500).send(error);
//     });
// };

// exports.save_song = function(req, res) {
//     var youtube_id = req.body.youtube_id,
//         title = req.body.title,
//         artist = req.body.artist,
//         lyrics = req.body.lyrics;
//     db.insert_song(youtube_id, title, artist, lyrics).then(success, failure);

//     function success(response) {
//         res.send(response);
//     }

//     function failure(error) {
//         res.status(500).send(error);
//     }
// };

// exports.save_lyrics = function(req, res) {
//     var youtube_id = req.body.youtube_id,
//         lyrics = req.body.lyrics;
//     db.insert_lyrics(youtube_id, lyrics).then(success, failure);

//     function success(response) {
//         res.send(response);
//     }

//     function failure(error) {
//         res.status(500).send(error);
//     }
// };
