import z from "zod";

const PatientRegistrationZodSchema = z.object({
	name: z
		.string("Not A String")
		.min(3, "Name must be at least 3 characters.")
		.max(20, "Name must be at most 20 characters."),
	email: z.email("Not an email!"),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain atleast 1 uppercase letter.")
		.regex(/[a-z]/, "Password must contain atleast 1 lowercase letter.")
		.regex(/[0-9]/, "Password must contain atleast 1 number.")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain atleast 1 special charecter.",
		),
	patient: z
		.object({
			contactNumber: z.string().optional(),
		})
		.optional(),
});

const PatientEmailVerifyZodSchema = z.object({
	email: z.email("Not an email!"),
	otp: z.string().length(6),
});

const LoginZodSchema = z.object({
	email: z.email(),
	password: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain atleast 1 uppercase letter.")
		.regex(/[a-z]/, "Password must contain atleast 1 lowercase letter.")
		.regex(/[0-9]/, "Password must contain atleast 1 number.")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain atleast 1 special charecter.",
		),
});
const forgotPasswordZodSchema = z.object({
	email: z.email(),
});

const resetPasswordZodSchema = z.object({
	email: z.email(),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.regex(/[A-Z]/, "Password must contain atleast 1 uppercase letter.")
		.regex(/[a-z]/, "Password must contain atleast 1 lowercase letter.")
		.regex(/[0-9]/, "Password must contain atleast 1 number.")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain atleast 1 special charecter.",
		),
	otp: z.string().length(6),
});

export const UserValidation = {
	PatientRegistrationZodSchema,
	PatientEmailVerifyZodSchema,
	LoginZodSchema,
	forgotPasswordZodSchema,
	resetPasswordZodSchema,
};
