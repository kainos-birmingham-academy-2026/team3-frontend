export interface JobRole {
    jobRoleId: number,
    roleName: String,
    location: String,
    capabilityId: String,
    bandId: number,
    closingDate: String,
    status: String
}


export class jobRoleService {
  private jobRoles: JobRole[] = [
    {
      jobRoleId: 1,
      roleName: "Software Engineer",
      location: "Birmingham",
      capabilityId: "Digital Services",
      bandId: 5,
      closingDate: "2026-08-05",
      status: "Open"
    },
  ];
    

}