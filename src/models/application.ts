export interface Application {
  applicationId: number;
  applicantName: string;
  applicantEmail: string;
  jobRoleId?: number | null;
  roleName: string;
  applicationDate: string;
  status: "pending" | "approved" | "rejected";
}
