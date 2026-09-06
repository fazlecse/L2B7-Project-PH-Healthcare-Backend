import { Router } from "express";

import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { auth } from "../../middleware/checkAuth";
import { validateRequest } from "../../middleware/validateRequest";
import { DoctorController } from "./doctor.controller";
import { doctorValidation } from "./doctor.validation";

const router = Router();

router.post(
	"/apply-as-doctor",
	upload.fields([
		{
			name: "resume",
			maxCount: 1,
		},
		{
			name: "additionalFiles",
			maxCount: 10,
		},
	]),
	DoctorController.applyAsDoctor,
);
router.post(
	"/apply-as-doctor/verify-email",
	validateRequest(doctorValidation.VerifyDoctorEmailZodSchema),
	DoctorController.verifyDoctorEmail,
);
router.post(
	"/approve-doctor",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	validateRequest(doctorValidation.ApproveDoctorZodSchema),
	DoctorController.approveDoctor,
);
router.get(
	"/all-doctors",
	auth(Role.ADMIN, Role.SUPER_ADMIN),
	DoctorController.getAllDoctors,
);

export const DoctorRoutes = router;
