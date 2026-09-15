import type { Request, Response } from "express";
import apiClient from "./config/apiClient";

interface JobApplicationReportRow {
  roleName: string;
  location: string;
  addressLine1: string;
  closingDate: string | null;
  vacancies: number;
  applicationCount: number;
  approved: number;
  rejected: number;
  hired: number;
}

function escapeCsvValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatClosingDate(closingDate: string | null): string {
  return closingDate ? closingDate.split("T")[0] ?? closingDate : "";
}

export const downloadJobsCsv = async (
  req: Request,
  res: Response,
): Promise<void> => {
try {
    const response = await apiClient.get<JobApplicationReportRow[]>(
      "/api/job-roles/application-report",
      {
        headers: {
          Authorization: `Bearer ${req.session.jwtToken}`,
        },
      },
    );

    const csv = [
      "Role,Location,Address line 1,Closing date,Vacancies,Number of applications,Approved,Rejected,Hired",
      ...response.data.map((role) =>
        [
          escapeCsvValue(role.roleName),
          escapeCsvValue(role.location),
          escapeCsvValue(role.addressLine1),
          formatClosingDate(role.closingDate),
          role.vacancies,
          role.applicationCount,
          role.approved,
          role.rejected,
          role.hired,
        ].join(","),
      ),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=jobs-report.csv",
    );

    res.status(200).send(csv);
  } catch {
    res.status(502).render("pages/404.njk", {
      errorMessage: "We could not generate the jobs report. Please try again.",
    });
  }
};