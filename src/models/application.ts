export interface Application {
	applicationId: number;
	applicantEmail: string;
	cvText?: string;
	jobRoleId?: number | null;
	roleName: string;
	applicationDate: string;
	status: "pending" | "approved" | "rejected" | "withdrawn";
}
