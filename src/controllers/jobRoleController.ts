import type { Request, Response } from "express";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
    constructor(private jobRoleService: JobRoleService) {}

   async getAll(req: Request, res: Response): Promise<void> {
     const jobRoles = await this.jobRoleService.getAll();
     res.render("pages/jobRoleList.njk", { jobRoles });
   }
   async getById(req: Request, res: Response): Promise<void> {
      const jobRoleId = await this.jobRoleService.getById(req.params.id);
      res.render("pages/jobRoleDetail.njk", { jobRoleId });
   }


}
