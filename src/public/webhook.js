var requests = { };

// Handler for when user clicks on a request item
function onRequestClicked(str) {
    var message = requests[parseInt(str)];
    
    var requestData = message.date + '\n' 
        + 'From: ' + message.remoteAddress + '\n'
        + '------------------------------' + '\n'
        + message.type + ' ' + message.url  + '\n';
    
    var propValue;
    for(var propName in message.headers) {
        propValue = message.headers[propName];
        requestData += propName + ': '  + propValue + '\n';
    }
    
    requestData += '\n' + JSON.stringify(JSON.parse(message.body), null, 2);

    $('pre').html(requestData);
}

jQuery(document).ready(function () {
    var itemCount = 0;
    
    setGetParameter();

    var hookId = '/' + getUrlVars()["hookId"];
    jQuery('#webhood_location').text('WebHook URL: ' + window.location.protocol + '//' + location.hostname + ":8080" + hookId);
    
	var log_webhook_message = function  (message, type) {
        itemCount++;
        requests[itemCount] = message;
		var li = jQuery('<li onclick="onRequestClicked(this.id)" id="' + itemCount + ' " />').text(message.type + ' ' + message.url + ' (' + message.body.length + ' bytes)');
		
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
        socket.emit('join', {message: hookId });
	});
    
});

// Sets a random hookId if was was not provided by user
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

// Convert Query Parameter to a JSON object
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



