jQuery(document).ready(function () {
    var requests = { };
    
    setGetParameter();
    
	var log_webhook_message = function  (message, type) {
		var li = jQuery('<li />').text(message.type + ' ' + message.url);
		
		if (type === 'system') {
			li.css({'font-weight': 'bold'});
		} else if (type === 'leave' || type === 'error') {
			li.css({'font-weight': 'bold', 'color': '#F00'});
		}
				
		jQuery('#requestItems').append(li);
	};

	var socket = io.connect(':3000');

//	socket.on('entrance', function  (data) {
//		log_webhook_message(data.message, 'system');
//	});
//
//	socket.on('exit', function  (data) {
//		log_webhook_message(data.message, 'leave');
//	});
//
//	socket.on('webhook', function  (data) {
//		log_webhook_message(data.message, 'normal');
//	});
//
//	socket.on('error', function  (data) {
//		log_webhook_message(data.message, 'error');
//	});

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
    
   jQuery('#requestItems li').click(function() {
        console.log('Item clicked');
        alert('Clicked list. ');
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



