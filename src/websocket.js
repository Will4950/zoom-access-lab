import WebSocket from 'ws';
// import {createHmac} from 'node:crypto';

async function handleMessage(zoom, message) {
	let data = {};

	try {
		// data = {module, content, header}
		data = JSON.parse(message);
	} catch (e) {
		console.warn('Invalid JSON received');
		return;
	}

	if (data.module === 'message') {
		console.log(data);
		// payload verification
	} else {
		console.log(`data | ${message}`);
	}
}

function handleError() {
	console.error(
		'Something went wrong connecting the WebSocket.  Verify your WSS Endpoint URL and try again.'
	);
	process.exit(500);
}

function handleOpen(zoom) {
	function sendHeartbeat() {
		zoom.ws.send(
			JSON.stringify({
				module: 'heartbeat'
			})
		);
		zoom.heartbeat = setTimeout(sendHeartbeat, 15000 * Math.random());
	}
	sendHeartbeat();
}

function handleClose() {
	console.log('Remote server closed the socket.');
	process.exit();
}

export async function connect(zoom) {
	try {
		zoom.ws = new WebSocket(
			`${zoom.wssEndpoint}&access_token=${zoom.access_token}`
		);
	} catch {
		console.error(
			'Something went wrong connecting the WebSocket.  Verify your credentials are correct and try again.'
		);
		process.exit(500);
	}

	zoom.ws.on('error', handleError);
	zoom.ws.on('open', () => {
		handleOpen(zoom);
	});
	zoom.ws.on('close', handleClose);
	zoom.ws.on('message', (message) => {
		handleMessage(zoom, message);
	});
}
