export interface Application {
  applicationId: number;
  applicantName: string;
  applicantEmail: string;
  roleName: string;
  applicationDate: string;
  status: "pending" | "approved" | "rejected";
}
