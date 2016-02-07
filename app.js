require('dotenv').config();

var express = require('express');
var routes = require('./routes');

var app = express();
var swig = require('swig');

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



app.listen(80);
