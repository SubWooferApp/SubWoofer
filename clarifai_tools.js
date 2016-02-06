var Clarifai = require('./lib/clarifai_node.js');
Clarifai.initAPI('BJCpT_mnhysKgy2n0cI6mhNZNqggpJpJmsqbwvBz', 'spcZJuQduHYjDN9BjyFTT2-I6TMSzKuFneW45xHT');

Clarifai.setLogHttp(true);

Clarifai.setThrottleHandler(function(bThrottled, waitSeconds) {
    console.log(bThrottled ? ["throttled. service available again in", waitSeconds, "seconds"].join(' ') : "not throttled");
});

function resultHandler(err, res) {

    if (err != null) {
        if (typeof err["status_code"] === "string" && err["status_code"] === "TIMEOUT") {
            console.log("TAG request timed out");
        } else if (typeof err["status_code"] === "string" && err["status_code"] === "ALL_ERROR") {
            console.log("TAG request received ALL_ERROR. Contact Clarifai support if it continues.");
        } else if (typeof err["status_code"] === "string" && err["status_code"] === "TOKEN_FAILURE") {
            console.log("TAG request received TOKEN_FAILURE. Contact Clarifai support if it continues.");
        } else if (typeof err["status_code"] === "string" && err["status_code"] === "ERROR_THROTTLED") {
            console.log("Clarifai host is throttling this application.");
        } else {
            console.log("TAG request encountered an unexpected error: ");
            console.log(err);
        }
    } else {
        if (typeof res["status_code"] === "string" &&
            (res["status_code"] === "OK" || res["status_code"] === "PARTIAL_ERROR")) {

            // // the request completed successfully
            // for (i = 0; i < res.results.length; i++) {
            //     if (res["results"][i]["status_code"] === "OK") {
            //         console.log('docid=' + res.results[i].docid +
            //             ' local_id=' + res.results[i].local_id +
            //             ' tags=' + res["results"][i].result["tag"]["classes"]);
            //     } else {
            //         console.log('docid=' + res.results[i].docid +
            //             ' local_id=' + res.results[i].local_id +
            //             ' status_code=' + res.results[i].status_code +
            //             ' error = ' + res.results[i]["result"]["error"]);
            //     }
            // }
            console.log(res.results);
        }
    }
}


exports.tagVideo = function(yt_id, chunk) {
    var testImageURL = `http://subwoofer.mangohacks.com/${yt_id}/${yt_id}${chunk}.mp4`;

    Clarifai.tagURL(testImageURL, yt_id, resultHandler);
};

Clarifai.clearThrottleHandler();
