import prompts from 'prompts';
import {setKey} from './lowdb.js';

const onCancel = () => {
	process.exit();
};

export async function enterConfigValue(value) {
	await prompts(
		{
			type: 'text',
			message: `Enter your ${value}`,
			name: 'res'
		},
		{
			onSubmit: async (prompt, answer) => {
				await setKey(value, answer);
			},
			onCancel
		}
	);
}

export async function confirmContinue(message) {
	const confirm = await prompts(
		{
			type: 'confirm',
			name: 'value',
			message,
			initial: true
		},
		{
			onCancel
		}
	);
	return confirm.value;
}
