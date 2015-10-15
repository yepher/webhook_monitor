var requests = { };

function onRequestClicked(str) {
    var message = requests[parseInt(str)];
    $('pre').html(JSON.stringify(JSON.parse(message.body), null, 2));
}

jQuery(document).ready(function () {
    
    var itemCount = 0;
    
    setGetParameter();
    
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

	var socket = io.connect(':3000');

    socket.on('requestData', function  (data) {
        
        console.log("RX: " + data);
		log_webhook_message(data.message, 'normal');
	});
    
	jQuery('#webhook_box').keypress(function (event) {
		if (event.which == 13) {
			socket.emit('webhook', {message: jQuery('#webhook_box').val()});
			jQuery('#webhook_box').val('');
		}
	});
    
});

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



