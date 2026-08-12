import axios from "axios";
import type { Request, Response } from "express";

import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
    constructor(private jobRoleService: JobRoleService) {}

  private getJwtToken(req: Request): string | undefined {
    return req.session.jwtToken;
	}

    async getAll(req: Request, res: Response): Promise<void> {
    const jwtToken = this.getJwtToken(req);

    if (!jwtToken) {
      res.redirect("/login");
      return;
    }

      try {
        const jobRoles = await this.jobRoleService.getAll(jwtToken);
        res.render("pages/jobRoleList.njk", { jobRoles });
      } catch (error) {
        if (this.handleUnauthorized(req, res, error)) {
          return;
        }
        this.renderApiError(res, error);
      }
    }

    async getById(req: Request, res: Response): Promise<void> {
      try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));
        res.render("pages/jobRoleDetail.njk", { jobRoleId });
      } catch (error) {
        if (this.handleUnauthorized(req, res, error)) {
          return;
        }
        this.renderApiError(res, error);
      }
    }

    private handleUnauthorized(req: Request, res: Response, error: unknown): boolean {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        req.session.jwtToken = undefined;
			req.session.userRole = undefined;
        res.redirect("/login");
        return true;
      }

      return false;
    }

    private renderApiError(res: Response, error: unknown): void {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load job roles";

      res.status(500).render("pages/jobRoleList.njk", {
        jobRoles: [],
        errorMessage,
      });
    }
}

