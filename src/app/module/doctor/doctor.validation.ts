import z from "zod";
import { DoctorVerificationStatus } from "../../../generated/prisma/enums";

export const ApplyAsDoctorZodSchema = z.object({
	user: z.object({
		name: z.string().trim().min(2, "Name must be atleast 2 characters long"),
		email: z.email("Invalid email address").trim().toLowerCase(),
	}),

	doctor: z.object({
		address: z
			.string()
			.trim()
			.min(5, "Address must be atleast 5 characters long.")
			.optional(),
		specialization: z.string().trim().min(2, "Specialization is required."),
		licenseNumber: z.string().trim().min(3, "Licence number is required."),
		qualifications: z.string().trim().min(2, "Qualifications is required."),
		experienceYears: z
			.number()
			.int("Experience Year must be an integer.")
			.min(0, "Experience year can not be nagative."),
		bio: z
			.string()
			.trim()
			.max(1000, "Bio cannot exceed 1000 characters.")
			.optional(),
		consultationFee: z
			.number()
			.int("Consultation fee must be an integer.")
			.min(0, "Consultation fee can not be nagative.")
			.optional(),
		contactNumber: z
			.string()
			.trim()
			.min(5, "Contact number is invalid")
			.optional(),
	}),
});

const VerifyDoctorEmailZodSchema = z.object({
	email: z.email("Not and Email."),
	otp: z.string().length(6),
});

const ApproveDoctorZodSchema = z
	.object({
		doctorId: z.string("Doctor id is required."),
		verificationStatus: z.enum(DoctorVerificationStatus),
		rejectionReason: z.string().trim().optional(),
	})
	.refine(
		(data) =>
			data.verificationStatus !== DoctorVerificationStatus.REJECTED ||
			!!data.rejectionReason,
		{
			message:
				"Rejection Reason Is Required When Rejecting A Doctor Application",
			path: ["rejectionReason"],
		},
	);

const UpdateDoctorProfileValidationZodSchema = z.object({
	address: z
		.string()
		.trim()
		.min(5, "Address must be at least 5 characters long")
		.optional(),

	bio: z
		.string()
		.trim()
		.max(1000, "Bio cannot exceed 1000 characters")
		.optional(),

	consultationFee: z
		.number()
		.min(0, "Consultation fee cannot be negative")
		.optional(),

	contactNumber: z
		.string()
		.trim()
		.min(5, "Contact number is invalid")
		.optional(),
});

export const doctorValidation = {
	VerifyDoctorEmailZodSchema,
	ApproveDoctorZodSchema,
	UpdateDoctorProfileValidationZodSchema,
};
