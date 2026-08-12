export interface JobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string | null;
  status: string;
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  openPositions?: number;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
}
