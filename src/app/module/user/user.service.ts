import type { UploadApiResponse } from "cloudinary";
import httpStatus from "http-status";
import { cloudinary } from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

const uploadProfileImage = async (buffer: Buffer, userId: string) => {
	// cloudinary.uploader
	// 	.upload_stream({ resource_type: "auto" }, async (error, result) => {
	// 		if (error) {
	// 			console.log(error);
	// 			throw new Error(error?.message);
	// 		}
	// 		const updateUser = await prisma.user.update({
	// 			where: { id: userId },
	// 			data: {
	// 				imageUrl: result?.secure_url,
	// 				imagePublicId: result?.public_id,
	// 			},
	// 		});
	// 		console.log(updateUser, "updated user");
	// 	})
	// 	.end(buffer);

	const currentUser = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			imagePublicId: true,
			imageUrl: true,
		},
	});

	const cloudinaryResult = await new Promise<UploadApiResponse>(
		(resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ resource_type: "auto" }, async (error, result) => {
					if (error) {
						console.log(error);
						return reject(error);
					}
					if (!result) {
						return reject(
							new AppError(
								httpStatus.BAD_GATEWAY,
								"No result returned from cloudinary.",
							),
						);
					}
					resolve(result);
				})
				.end(buffer);
		},
	);

	const updateUser = await prisma.user.update({
		where: { id: userId },
		data: {
			imageUrl: cloudinaryResult.secure_url,
			imagePublicId: cloudinaryResult.public_id,
		},
		omit: {
			password: true,
		},
	});

	if (currentUser?.imagePublicId && currentUser.imageUrl) {
		await cloudinary.uploader.destroy(currentUser.imagePublicId);
	}

	return updateUser;
};

export const UserServices = {
	uploadProfileImage,
};
