require('dotenv').config();

var express = require('express');
var routes = require('./routes');

var app = express();
var swig = require('swig');
var favicon = require('serve-favicon');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL);

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(express.static('videos'));
app.use(express.static('public'));

// Views
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view cache', false);
swig.setDefaults({ cache: false });

app.get('/', routes.home);

app.post('/vid', function(req, res) {
    res.status(200).send();
});
app.get('/youtube/:youtube_url', routes.downloadYouTubeVideo);

app.get('/videos', routes.getVideos);

// app.post('/songs/find', routes.find_lyrics);
// app.post('/songs/save', routes.save_song);
// app.post('/songs/lyrics/save', routes.save_lyrics);

app.listen(80);
