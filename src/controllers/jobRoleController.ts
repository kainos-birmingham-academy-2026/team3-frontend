import axios from "axios";
import type { Request, Response } from "express";

import type { ApplicationService } from "../services/applicationService";
import type { JobRoleService } from "../services/jobRoleService";

export class JobRoleController {
  constructor(
    private jobRoleService: JobRoleService,
    private applicationService: ApplicationService,
  ) {}

  private getJwtToken(req: Request): string | undefined {
    return req.session.jwtToken;
	}

  private getJobRoleId(req: Request): string {
    return Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  }

  private canApply(status: string, openPositions?: number): boolean {
    return (
      status === "open" &&
      typeof openPositions === "number" &&
      openPositions > 0
    );
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
      const id = this.getJobRoleId(req);
      const jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));
      const canApply = this.canApply(jobRoleId.status, jobRoleId.openPositions);
      const hasApplied = req.query?.applied === "1";

      res.render("pages/jobRoleDetail.njk", {
        jobRoleId,
        canApply,
        applicationSuccessMessage: hasApplied
          ? "Application submitted successfully. Your application is now in progress."
          : undefined,
      });
    } catch (error) {
      if (this.handleUnauthorized(req, res, error)) {
        return;
      }
      this.renderApiError(res, error);
    }
  }

  async showApplyPage(req: Request, res: Response): Promise<void> {
    try {
      const id = this.getJobRoleId(req);
      const jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));

      if (!this.canApply(jobRoleId.status, jobRoleId.openPositions)) {
        res.status(403).render("pages/accessRestricted.njk");
        return;
      }

      res.render("pages/jobRoleApply.njk", { jobRoleId });
    } catch (error) {
      if (this.handleUnauthorized(req, res, error)) {
        return;
      }
      this.renderApiError(res, error);
    }
  }

  async submitApplication(req: Request, res: Response): Promise<void> {
    try {
      const id = this.getJobRoleId(req);
      const jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));

      if (!this.canApply(jobRoleId.status, jobRoleId.openPositions)) {
        res.status(403).render("pages/accessRestricted.njk");
        return;
      }

      const cvFile = req.file;

      if (!cvFile) {
        res.status(400).render("pages/jobRoleApply.njk", {
          jobRoleId,
          errorMessage: "Upload your CV before submitting your application.",
        });
        return;
      }

      await this.applicationService.submitApplication({
        jobRoleId: id,
        jwtToken: this.getJwtToken(req),
        cvBuffer: cvFile.buffer,
        cvFileName: cvFile.originalname,
        cvMimeType: cvFile.mimetype,
        status: "in progress",
      });

      res.redirect(`/job-role-list/${id}?applied=1`);
    } catch (error) {
      if (this.handleUnauthorized(req, res, error)) {
        return;
      }

      const id = this.getJobRoleId(req);
      const jobRoleId = await this.jobRoleService.getById(id, this.getJwtToken(req));
      const errorMessage =
        error instanceof Error ? error.message : "Unable to submit application";

      res.status(500).render("pages/jobRoleApply.njk", {
        jobRoleId,
        errorMessage,
      });
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

