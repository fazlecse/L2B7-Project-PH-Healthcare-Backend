export interface IBookAppointmentPayload {
	doctorId: string;
	scheduleId: string;
}

export interface IPayAppointmentPayload {
	appointmentId: string;
}

export interface ICancelAppointmentPayload {
	appointmentId: string;
}
export interface IUpdateAppointmentStatusPayload {
	status: "ONGOING" | "COMPLETED";
}
