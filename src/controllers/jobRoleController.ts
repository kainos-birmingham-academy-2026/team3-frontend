import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
  
    constructor(private jobRoleService: JobRoleService) {}

   async getAll(req: Request, res: Response): Promise<void> {
     const jobRoles = await this.jobRoleService.getAll();
     res.render("pages/jobRoleList.njk", { jobRoles });
   }
}

