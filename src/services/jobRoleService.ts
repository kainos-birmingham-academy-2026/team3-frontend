export interface JobRole {
    jobRoleId: number,
  roleName: string,
  location: string,
    capabilityId: number,
    bandId: number,
  closingDate: Date,
  status: string
}


export class JobRoleService {
  private jobRoles: JobRole[] = [
    {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capabilityId: 1,
      bandId: 5,
      closingDate: new Date("2026-08-05T00:00:00.000Z"),
      status: "Open"
    },
  ];

  async getAll(): Promise<JobRole[]> {
    return this.jobRoles;
  }
    

}