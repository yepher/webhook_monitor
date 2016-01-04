var requests = { };

// Handler for when user clicks on a request item
function onRequestClicked(str) {
    var message = requests[parseInt(str)];
    
    var httpHeader = message.date + '\n' 
        + 'From: ' + message.remoteAddress + '\n'
        + 'Listeners: ' + message.listeners + '\n'
        + '------------------------------' + '\n'
        + message.type + ' ' + message.url  + '\n';
    
    var propValue;
    for(var propName in message.headers) {
        propValue = message.headers[propName];
        httpHeader += propName + ': '  + propValue + '\n';
    }
    
    var requestData = "";
    try {
        requestData += JSON.stringify(JSON.parse(message.body), null, 2);
    } catch(e) {
        requestData += '\nERROR: Failed to parse json because: ' + e + '\n\n';
        requestData += '\n' + message.body;
    }

    pre = document.getElementById('httpHeaders');
    pre.textContent = httpHeader;
    //$('httpHeaders').html(httpHeader);
    
    var editor = ace.edit("editor");
    editor.setValue(requestData);
    editor.scrollToLine(0);
}

jQuery(document).ready(function () {
    var itemCount = 0;
    
    setGetParameter();

    var hookId = '/' + getUrlVars()["hookId"];
    hookId = hookId.split('#')[0];
    jQuery('#webhood_location').text('WebHook URL: ' + window.location.protocol + '//' + location.hostname + ":8080" + hookId);
    
	var log_webhook_message = function  (message, type) {
        itemCount++;
        requests[itemCount] = message;
		var li = jQuery('<li onclick="onRequestClicked(this.id)" id="' + itemCount + ' " />').text(message.type + ' ' + message.url + ' From: [' + message.remoteAddress + '] (' + message.body.length + ' bytes) listeners: (' + message.listeners + ')');
		
        // Preparse payload so we can render it red in list if not valid JSON
        try {
            if (message.body && message.body.length > 0) {
                JSON.stringify(JSON.parse(message.body), null, 2);
            }
        } catch(e) {
            type = 'error';
        }

		if (type === 'system') {
			li.css({'font-weight': 'bold'});
		} else if (type === 'leave' || type === 'error') {
			li.css({'font-weight': 'bold', 'color': '#F00'});
		}
				
		jQuery('#requestItems').append(li);
	};

	var socket = io.connect(':3000"');

    socket.on('requestData', function  (data) {
		log_webhook_message(data.message, 'normal');
	});
    
    socket.on('connected', function  (data) {
        var hookId = '/' + getUrlVars()["hookId"];
        hookId = hookId.split('#')[0];
        socket.emit('join', {message: hookId });
	});
    
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
    //console.log('TODO: saveHTTPArchive()');
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
                text: "<html><body><h1>WebHook Landing Page</h1>View your data <a href=\"localhost:3000/?hookId=389956\">here</a><br>Listeners: 1</body></html>"
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



