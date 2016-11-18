var divStatus;
var currentStatus = "disconnected";

function setStatus(val) {
    console.log("webhook status: " + val);
    divStatus = val;
    divStatus.className = currentStatus;
}

jQuery(document).ready(function () {
    var itemCount = 0;
    
    setGetParameter();

    var hookId = '/' + getUrlVars()["hookId"];
    hookId = hookId.split('#')[0];
    jQuery('#webhood_location').text('WebHook URL: ' + window.location.protocol + '//' + location.hostname + ":8080" + hookId);

    setWStatus("connecting");
	var socket = io.connect(':3000"');
    
    socket.on('requestData', function  (data) {
		setWStatus(data.message, 'normal');
	});
    
    socket.on('connected', function  (data) {
        console.log("web socekt connected")
        var hookId = '/' + getUrlVars()["hookId"];
        hookId = hookId.split('#')[0];
        socket.emit('join', {message: hookId });
        
        setWStatus("connected");
	});
    
    socket.on('disconnect', function  (data) {
		console.log("web socekt disconnected")
        setWStatus("disconnected");
	});
    
    function setWStatus(status) {
        currentStatus = status;
        if (!divStatus) {
            console.log("ERROR: divStatus not set");
            return;
        }
        console.log("setWStatus from:[" + divStatus.className + "] to[" + status + "]");
        divStatus.className = status;
    }
});

// Sets a random hookId if one was not provided by user
function setGetParameter() {
    var hookId = "hookId"
    var url = window.location.href;
    if (!(url.indexOf(hookId + "=") >= 0)) {
        if (url.indexOf("?") < 0) {
            url += "?" + hookId + "=" + Math.floor((Math.random() * 1000000) + 1);
        } else {
            url += "&" + hookId + "=" + Math.floor((Math.random() * 1000000) + 1);
        }
        console.log("URL: " + url);
        window.location.href = url;
    } 
}

// Convert Query Parameters to a JSON object
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/** 
    Saves the Web hook data as an HTTP Archive (.har)
    
    See: https://dvcs.w3.org/hg/webperf/raw-file/tip/specs/HAR/Overview.html
**/
function saveHTTPArchive() {
    // Very basic support for saving web hook requests to HTTP Archive (.har) format
    
    var data = {
            log : { 
                version: "1.2",
                creator : {
                    name: "WebHook Monitor",
                    version: "0.0.1",
                    coment: "https://github.com/yepher/webhook_monitor"
                },
                entries: [ ]
            }
    };
    
    var i = 0;
    var entries = [];
    var requests = parent.window.frames['requestFrame'].requests;
    for (idx in requests) {
        var request = requests[idx];
        
        //console.log(JSON.stringify(request));

        var ref = 'page_' + i++;
        var item = {
            "pageref": ref,
            "startedDateTime": request.date,
            "time": 0,
            "request": {
                method:request.type,
                url: 'http://' + request.headers['host'] + request.url,
                httpVersion:"unknown",
                headers:[ ],
                queryString: [],
                cookies: [],
                headersSize: -1,
                bodySize: request.body.length
            },
            response: {
              status: 200,
              statusText: "OK",
              httpVersion: "HTTP/1.1",
              headers: [
                {
                  name: "Date",
                  value: request.date
                },
                {
                  name: "Connection",
                  value: "keep-alive"
                },
                {
                  name: "Transfer-Encoding",
                  value: "chunked"
                },
                {
                  name: "Content-Type",
                  value: "text/html"
                }
              ],
              cookies: [],
              content: {
                size: 134,
                mimeType: "text/html",
                compression: -11,
                text: request.responseData
              },
              redirectURL: "",
              headersSize: 133,
              bodySize: 145,
              _transferSize: 278
            },
            cache: {},
            timings: {},
            serverIPAddress: "",
            "connection": 'x' + JSON.stringify(request.remoteAddress),
            "comment": ""
        };
        
        if (request.body.length > 0) {
            item.request.postData = {
                mimeType: request.headers['content-type'],
                text : request.body,
                comment: ""
            }
        }
        
        var headers = [ ];
        // Put headers in request
        for (key in request.headers) {
            var headerItem = {
                name:key,
                value:request.headers[key]
            }
            
           headers.push(headerItem);
        }
        item.request.headers = headers;
        
        entries.push(item);
    }

    data.log.entries = entries;
    
    //console.log(data);
    var json = JSON.stringify(data, null, 2);
    download(json, "webhooks.har", "application/json");

}



