import Bluebird = require("bluebird");
import redis = require('redis');

Bluebird.promisifyAll(redis.RedisClient.prototype);

declare module 'redis' {
	export interface AsyncRedisClient extends redis.RedisClient {
		getAsync(key: string): Bluebird<string>;

		setAsync(key: string, value: string): Bluebird<'OK'>;

		multi(): AsyncMulti;

		quitAsync(): Bluebird<'OK'>;
	}

	export interface AsyncMulti extends redis.Multi {
		getAsync(key: string): AsyncMulti;

		setAsync(key: string, value: string): AsyncMulti;

		execAsync(...args: any[]): Bluebird<any>;
	}
}

function getClient(): redis.AsyncRedisClient {
	return redis.createClient({
		host: 'redis'
	}) as redis.AsyncRedisClient;
}

export {
	getClient
}
