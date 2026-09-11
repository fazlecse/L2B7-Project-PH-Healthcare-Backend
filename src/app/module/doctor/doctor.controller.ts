import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DoctorServices } from "./doctor.service";
import { ApplyAsDoctorZodSchema } from "./doctor.validation";

const applyAsDoctor = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as { [fieldname: string]: Express.Multer.File[] };
	const resume = files?.["resume"] ? files["resume"][0] : null;
	const additionalFiles = files?.["additionalFiles"] || [];
	const zodValidationResult = ApplyAsDoctorZodSchema.safeParse(
		JSON.parse(req.body.data),
	);

	if (!zodValidationResult.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			zodValidationResult.error.issues[0].message,
		);
	}
	const payload = zodValidationResult.data;
	const result = await DoctorServices.applyAsDoctor(
		payload,
		resume,
		additionalFiles,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied as doctor successfully.",
		data: result,
	});
});
const verifyDoctorEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await DoctorServices.verifyDoctorEmail(payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied as doctor successfully.",
		data: result,
	});
});
const approveDoctor = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const user = req.user!;
	const result = await DoctorServices.approveDoctor(payload, user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Applied as doctor successfully.",
		data: result,
	});
});
const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
	const query = req.query;
	const { data, meta } = await DoctorServices.getAllDoctors(query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Doctors Retrived successfully.",
		data: data,
		meta: meta,
	});
});

export const DoctorController = {
	applyAsDoctor,
	verifyDoctorEmail,
	approveDoctor,
	getAllDoctors,
};
