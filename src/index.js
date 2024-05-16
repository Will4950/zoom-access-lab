import {connect} from './websocket.js';
import {getAccessToken, loadConfiguration} from './zoom.js';

console.log('Starting Zoom Access Lab...');

const zoom = new Object();
await loadConfiguration(zoom);
await getAccessToken(zoom);
await connect(zoom);
