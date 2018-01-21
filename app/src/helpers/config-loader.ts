import * as fs from 'fs';

const loadedSecrets: { [key: string]: string } = {};

const getSecret: ((key: string) => string) = (key) => {
	if (loadedSecrets[key] === undefined) {
		console.log(`Secret from disk: ${key}`);
		loadedSecrets[key] = fs.readFileSync(`/run/secrets/${key}`).toString().trim();
	}
	console.log(`Secret from cache: ${key}`);
	return loadedSecrets[key];
};

export {getSecret};
