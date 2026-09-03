export interface UserApplication {
	applicationId: number;
	jobRoleId: number;
	roleName: string;
	applicationDate: string;
	status: "pending" | "approved" | "rejected" | "withdrawn";
	cvText: string;
}
