import _ from 'underscore';
import ora from 'ora';

import {getKey, setKey} from './lowdb.js';
import {confirmContinue, enterConfigValue} from './prompts.js';

const zoomOAuth = 'https://zoom.us/oauth';

export async function loadConfiguration(zoom) {
	const spinner = ora();
	spinner.start('Loading configuration');
	zoom.accountId = getKey('accountId');
	zoom.clientId = getKey('clientId');
	zoom.clientSecret = getKey('clientSecret');
	zoom.wssEndpoint = getKey('wssEndpoint');
	zoom.secretToken = getKey('secretToken');

	const configFound =
		_.isEmpty(zoom.accountId) ||
		_.isEmpty(zoom.clientId) ||
		_.isEmpty(zoom.clientSecret) ||
		_.isEmpty(zoom.wssEndpoint) ||
		_.isEmpty(zoom.secretToken)
			? false
			: true;

	if (configFound) {
		spinner.succeed();
		if (await confirmContinue('Continue with existing configuration?')) {
			return zoom;
		} else {
			await setKey('accountId', null);
			await setKey('clientId', null);
			await setKey('clientSecret', null);
			await setKey('wssEndpoint', null);
			await setKey('secretToken', null);
			console.log('Existing configuration removed');
			await loadConfiguration(zoom);
		}
	} else {
		spinner.fail('Configuration not found');
		await enterConfigValue('accountId');
		await enterConfigValue('clientId');
		await enterConfigValue('clientSecret');
		await enterConfigValue('wssEndpoint');
		await enterConfigValue('secretToken');
		await loadConfiguration(zoom);
	}
}

export async function getAccessToken(zoom) {
	const spinner = ora();
	spinner.start('Retrieving Access Token');

	const res = await fetch(
		`${zoomOAuth}/token?grant_type=account_credentials&account_id=${zoom.accountId}`,
		{
			method: 'POST',
			headers: {
				Authorization: `Basic ${Buffer.from(`${zoom.clientId}:${zoom.clientSecret}`, 'utf-8').toString('base64')}`,
				'Content-Type': 'application/x-www-form-urlencoded'
			}
		}
	);

	if (res.ok) {
		spinner.succeed();
		const data = await res.json();
		zoom.access_token = data.access_token;
		zoom.scope = data.scope;
		return data.access_token;
	} else {
		spinner.fail('Unable to get access_token.  Check configuration.');
		process.exit();
	}
}
