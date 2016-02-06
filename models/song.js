var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Lyrics for a 10 second clip
var Lyric = new Schema({
  words: [String]
});

var Song = new Schema({
  youtube_id: {
    type: String,
    required: true
  },
  title: String,
  artist: String,
  lyrics: [[String]]
});

mongoose.model('Lyric', Lyric);
mongoose.model('Song', Song);