import { addDays, differenceInMinutes, startOfDay } from "date-fns";
import httpStatus from "http-status";
import { IQuery } from "../../interfaces";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { ScheduleWhereInput } from "../../../generated/prisma/models";
import { ICreateSchedulePayload } from "./schedule.interface";

const createSchedule = async (
	payload: ICreateSchedulePayload,
	user: RequestUser,
) => {
	const doctor = await prisma.doctor.findUnique({
		where: {
			id: user.userId,
		},
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor Profile not found.");
	}

	//startDateTime = 2026-08-25T13:30:00.436Z => 1:30 PM
	const startOfTheDay = startOfDay(payload.startDateTime); // 25 August => 12:00 AM => 2026-08-25T00:00:00.436Z
	const startOfNextDay = addDays(startOfTheDay, 1); // 26 August => 12:00 AM => 2026-08-26T00:00:00.436Z

	const existingScheduleOnThisDate = await prisma.schedule.findFirst({
		where: {
			doctorId: doctor.id,
			isDeleted: false,
			startDateTime: {
				gte: startOfTheDay,
				lt: startOfNextDay,
			},
		},
	});

	if (existingScheduleOnThisDate) {
		throw new AppError(
			httpStatus.CONFLICT,
			"You Already Have A Schedule For This Date",
		);
	}

	const durationInMinutes = differenceInMinutes(
		payload.endDateTime,
		payload.startDateTime,
	);

	const MINUTES_ALLOCATED_PER_SLOT = 20;

	const totalSlots = Math.floor(durationInMinutes / MINUTES_ALLOCATED_PER_SLOT);
	const schedule = await prisma.schedule.create({
		data: {
			startDateTime: payload.startDateTime,
			endDateTime: payload.endDateTime,
			meetingLink: payload.meetingLink,
			totalSlots,
			availableSlots: totalSlots,
			doctorId: doctor.id,
		},
		include: {
			doctor: {
				select: {
					name: true,
					email: true,
					contactNumber: true,
				},
			},
		},
	});

	return schedule;
};

const getMySchedules = async (query: IQuery, user: RequestUser) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;
	const sortBy = query.sortBy ? query.sortBy : "createdAt";
	const sortOrder = query.sortOrder ? query.sortOrder : "desc";
	// OR
	// let limit = 10;
	// if (query.limit) {
	//     limit = Number(query.limit);
	// }

	// let page = 1;
	// if (query.page) {
	//     page = Number(query.page);
	// }

	// const skip = (page - 1) * limit;

	const doctor = await prisma.doctor.findUnique({
		where: { userId: user.userId },
	});

	if (!doctor) {
		throw new AppError(httpStatus.NOT_FOUND, "Doctor Profile Not Found");
	}

	const andConditions: ScheduleWhereInput[] = [
		{
			doctorId: doctor.id,
		},
		{
			isDeleted: false,
		},
	];
	if (query.status) {
		andConditions.push({ status: query.status });
	}

	const schedules = await prisma.schedule.findMany({
		where: {
			AND: andConditions,
		},

		take: limit,
		skip,
		orderBy: {
			// sortBy : sortOrder
			[sortBy]: sortOrder,
		},
		include: {
			appointments: {
				include: {
					patient: true,
				},
			},
		},
	});

	const total = await prisma.schedule.count({ where: { AND: andConditions } });

	return {
		data: schedules,
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

export const ScheduleService = {
	createSchedule,
	getMySchedules,
};
