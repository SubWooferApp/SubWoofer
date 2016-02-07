var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Video = new Schema({
    youtube_id: {
        type: String,
        required: true
    },
    title: String,
    thumb: String,
    lyrics: [String]
});

module.exports = mongoose.model('Video', Video);
