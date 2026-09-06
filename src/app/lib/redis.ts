import { createClient } from "redis";
import config from "../config";

export const redisClient = createClient({
	username: config.redis_user,
	password: config.redis_password,
	socket: {
		host: config.redis_host,
		port: Number(config.redis_port),
	},
});

// Without this listener, any socket-level error (network blip, timeout,
// Redis Cloud restart, etc.) after the initial connect is an unhandled
// "error" event on this EventEmitter, which crashes the whole process.
redisClient.on("error", (error) => {
	console.error("Redis Client Error:", error);
});
