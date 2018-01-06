class Constants {
	port: number;
	defaultPermissions: string[];
}

class Secrets {
	postgres: {
		host: string,
		username: string,
		password: string,
		database: string
	};
	sessionSecret: string;
	adminPassword: string;
}

const getConstants: (() => Constants) = () => {
	if (process.env.ENV === 'dev') {
		return require('../../constants.dev.json');
	} else {
		return require('../../constants.prod.json');
	}
};

const getSecrets: (() => Secrets) = () => {
	if (process.env.ENV === 'dev') {
		return require('../../secrets.dev.json');
	} else {
		return require('../../secrets.prod.json');
	}
};

export {getConstants, getSecrets};
