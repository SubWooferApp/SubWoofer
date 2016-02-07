var mongoose = require('mongoose'),
  models = require('./models/video');
var Video = mongoose.model('Video');

/**
 * Empty strings are not passed to Mongo. Also it works fine if any of 
 * these is undefined.
 * @return {promise} The promise representing the query
 */
exports.find = function(youtube_id, title, artist) {
  var deferred = Q.defer();
  var query = {};
  if (youtube_id !== undefined && youtube_id !== '') {
    query.youtube_id = youtube_id;
  }
  if (title !== undefined && title !== '') {
    query.title = title;
  }
  if (artist !== undefined && artist !== '') {
    query.artist = artist;
  }
  Song.find(query).find(handle_response);
  return deferred.promise;

  function handle_response(error, songs) {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve(songs);
    }
  }
};

// youtube_id is required
// lyrics should be an array of objects of the form { words: ['a', 'b'] }
exports.insert_song = function(youtube_id, title, artist, lyrics) {
  var deferred = Q.defer();
  var s = new Song({
    youtube_id: youtube_id,
    title: title,
    artist: artist,
    lyrics: lyrics
  });
  s.save(handle_response);
  return deferred.promise;

  function handle_response(error) {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve('Song saved');
    }
  }
};

// lyrics should be an array of objects of the form { words: ['a', 'b'] }
exports.insert_lyrics = function(youtube_id, lyrics) {
  var deferred = Q.defer();
  var query = {
    youtube_id: youtube_id
  };
  var changes = {
    $set: {
      'lyrics': lyrics
    }
  };
  var options = {
    multi: false,
    upsert: true
  };
  Song.update(query, changes, options, handle_response);
  return deferred.promise;

  function handle_response(error, num_affected) {
    if (error) {
      deferred.reject(new Error(error));
    } else {
      deferred.resolve(num_affected);
    }
  }
};
