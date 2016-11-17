# WebHook Snooper

This Node.js project allows you to view webhook calls to a server in your browser.

![ScreenShot](assets/ScreenShot.png)

## Similar Tools:

| Name  | Site  | Description  |
|---|---|---|
| Webhook.site  | [link](http://webhook.site/)  | Webhook Tester allows you to easily test webhooks and other types of HTTP requests.  |


## Example Usage

* WebHook Server: http://[SERVER]:8080/YouName
* Webhook Viewer: http://[SERVER]:3000/?hookId=YouName



## Getting started

* Fetch Source
	* `git clone https://github.com/yepher/webhook_monitor.git`
* Run Server
	* `cd webhook_monitor/src`
	* `npm install`
	* `node server.js`

	

## Signaling Design

![Design](assets/msg_design/1_MessageBus.png)


## UI Design

![Design](assets/msg_design/2_UI Design.png)

