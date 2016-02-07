var Clarifai = require('./lib/clarifai_node.js');
var q = require('q');

Clarifai.initAPI(process.env.CLARIFAI_CLIENT_ID, process.env.CLARIFAI_CLIENT_SECRET);

// Clarifai.setLogHttp( true );

Clarifai.setThrottleHandler(function(bThrottled, waitSeconds) {
    console.log(bThrottled ? ["throttled. service available again in", waitSeconds, "seconds"].join(' ') : "not throttled");
});

exports.tagVideo = function(yt_id, chunk) {
    var testImageURL = `http://subwoofer.mangohacks.com/${yt_id}/${yt_id}${chunk}.jpg`;
    var defer = q.defer();

    Clarifai.tagURL(testImageURL, yt_id, (err, res) => {
        if (err) {
            switch(err["status_code"]) {
            case "TIMEOUT":
                defer.reject("TAG request timed out");
                break;
            case "ALL_ERROR":
                defer.reject("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
                break;
            case "TOKEN_FAILURE":
                defer.reject("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
                break;
            case "ERROR_THROTTLED":
                defer.reject("Clarifai host is throttling this application.");
                break;
            default:
                console.log("TAG request encountered an unexpected error: ");
                defer.reject(err);
            }
        } else {
            if (res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR") {
                defer.resolve(res);
            }
        }
    });

    return defer.promise;
};

Clarifai.clearThrottleHandler();
