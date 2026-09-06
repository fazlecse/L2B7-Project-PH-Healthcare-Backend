import httpStatus from "http-status";
import config from "../config";
import { AppError } from "../utils/AppError";
import { redisClient } from "./redis";

export const getBkashIdToken = async () => {
	try {
		const IdTokenKey = "bkash:idToken";
		const RefreshTokenKey = "bkash:refreshToken";

		let bkashIdToken = await redisClient.get(IdTokenKey);
		const bkashIdTokenTTL = await redisClient.ttl(IdTokenKey);
		const bkashRefreshToken = await redisClient.get(RefreshTokenKey);
		const bkashRefreshTokenTTL = await redisClient.ttl(RefreshTokenKey);

		if (
			(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
			bkashRefreshToken &&
			bkashRefreshTokenTTL > 600
		) {
			const RefreshTokenResponse = await fetch(
				`${config.bkash_base_url}/tokenized/checkout/token/refresh`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "application/json",
						username: config.bkash_username,
						password: config.bkash_password,
					},
					body: JSON.stringify({
						app_key: config.bkash_app_key,
						app_secret: config.bkash_app_secret,
						refresh_token: bkashRefreshToken,
					}),
				},
			);

			if (!RefreshTokenResponse.ok) {
				throw new AppError(
					httpStatus.BAD_GATEWAY,
					"Bkash access token grant failed.",
				);
			}
			const bkashRefreshTokenResult = await RefreshTokenResponse.json();
			bkashIdToken = bkashRefreshTokenResult.id_token as string;
			await redisClient.set(IdTokenKey, bkashIdToken, {
				expiration: {
					type: "EX",
					value: 60 * 60,
				},
			});
			return bkashIdToken;
		}

		if (bkashIdTokenTTL > 600) {
			return bkashIdToken;
		}

		const response = await fetch(
			`${config.bkash_base_url}/tokenized/checkout/token/grant`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
					username: config.bkash_username,
					password: config.bkash_password,
				},
				body: JSON.stringify({
					app_key: config.bkash_app_key,
					app_secret: config.bkash_app_secret,
				}),
			},
		);

		if (!response.ok) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"Bkash access token grant failed.",
			);
		}
		const result = await response.json();
		// bkash id token set
		await redisClient.set(IdTokenKey, result.id_token, {
			expiration: {
				type: "EX",
				value: 60 * 60,
			},
		});
		// bkash refresh token set
		await redisClient.set(RefreshTokenKey, result.refresh_token, {
			expiration: {
				type: "EX",
				value: 60 * 60 * 24 * 28, //28 day
			},
		});
		bkashIdToken = result.id_token;
		console.log(bkashIdToken, "bkashIdToken");
		return bkashIdToken;
	} catch (error) {
		if (error instanceof AppError) {
			throw error;
		}
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			error instanceof Error ? error.message : "Bkash request failed.",
		);
	}
};
