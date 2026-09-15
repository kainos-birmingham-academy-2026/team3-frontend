import type { Request, Response } from "express";
import apiClient from "./config/apiClient";

interface JobApplicationReportRow {
  roleName: string;
  band: string;
  location: string;
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

const reportHeaders =
  "Role,Location,Closing date,Vacancies,Number of applications,Approved,Rejected,Hired";
const reportColumnCount = 8;
const bandSeniority = [
  "Apprentice",
  "Trainee",
  "Associate",
  "Senior Associate",
  "Consultant",
  "Manager",
  "Principal",
];

function createBandHeading(band: string): string {
  return [
    escapeCsvValue(`Band: ${band}`),
    ...Array(reportColumnCount - 1).fill(escapeCsvValue("----------------")),
  ].join(",");
}

function createBandSections(roles: JobApplicationReportRow[]): string[] {
  const bands = new Map<string, JobApplicationReportRow[]>();

  for (const role of roles) {
    const bandRoles = bands.get(role.band) ?? [];
    bandRoles.push(role);
    bands.set(role.band, bandRoles);
  }

  return [...bands.entries()]
    .sort(([firstBand], [secondBand]) => {
      const firstRank = bandSeniority.indexOf(firstBand);
      const secondRank = bandSeniority.indexOf(secondBand);

      if (firstRank === -1 && secondRank === -1) {
        return firstBand.localeCompare(secondBand);
      }
      if (firstRank === -1) return 1;
      if (secondRank === -1) return -1;
      return secondRank - firstRank;
    })
    .map(([band, bandRoles]) => {
      const rows = bandRoles
        .sort((firstRole, secondRole) =>
          firstRole.roleName.localeCompare(secondRole.roleName),
        )
        .map((role) =>
          [
            escapeCsvValue(role.roleName),
            escapeCsvValue(role.location),
            formatClosingDate(role.closingDate),
            role.vacancies,
            role.applicationCount,
            role.approved,
            role.rejected,
            role.hired,
          ].join(","),
        );

      return [createBandHeading(band), ...rows].join("\n");
    });
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
      reportHeaders,
      ...createBandSections(response.data),
    ].join("\n\n");

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