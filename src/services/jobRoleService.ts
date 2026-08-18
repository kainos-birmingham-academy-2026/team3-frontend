import axios from "axios";
import apiClient from "../config/apiClient";
import type {
	BandOption,
	CapabilityOption,
	CreateJobRoleInput,
	JobRole,
	LocationOption,
	StatusOption,
	UpdateJobRoleInput,
} from "../models/jobRole";

interface ApiJobRole {
	jobRoleId: number;
	roleName: string;
	location?: string;
	locationName?: string;
	capabilityName?: string;
	capabilityId?: number;
	bandName?: string;
	bandId?: number;
	closingDate?: string | null;
	status?: string;
	statusName?: string;
	description?: string;
	responsibilities?: string;
	sharepointUrl?: string;
	jobSpecUrl?: string;
	numberOfOpenPositions?: number;
	openPositions?: number;
	addressLine1?: string;
	addressLine2?: string;
	postcode?: string;
}

export class JobRoleService {
	private mapWritePayload(jobRoleData: CreateJobRoleInput) {
		const toOptionalNumber = (value: string | number | undefined) => {
			if (value === undefined || value === "") {
				return undefined;
			}

			const numberValue = Number(value);
			return Number.isFinite(numberValue) ? numberValue : undefined;
		};

		return {
			...jobRoleData,
			numberOfOpenPositions: toOptionalNumber(
				jobRoleData.numberOfOpenPositions,
			),
			capabilityId: toOptionalNumber(jobRoleData.capabilityId),
			bandId: toOptionalNumber(jobRoleData.bandId),
			locationId: toOptionalNumber(jobRoleData.locationId),
			closingDate: jobRoleData.closingDate || undefined,
		};
	}

	private mapStatus(jobRole: ApiJobRole): string {
		const status = jobRole.status ?? jobRole.statusName;
		return status ? status.toLowerCase() : "unknown";
	}

	// closingDate is optional on the backend, so roles created without one come back as null.
	private mapClosingDate(closingDate?: string | null): string {
		if (!closingDate) {
			return "";
		}
		return closingDate.split("T")[0] ?? closingDate;
	}

	private mapJobRole(jobRole: ApiJobRole): JobRole {
		return {
			jobRoleId: jobRole.jobRoleId,
			roleName: jobRole.roleName,
			location: jobRole.location ?? jobRole.locationName ?? "Unknown",
			capability:
				jobRole.capabilityName ??
				(jobRole.capabilityId !== undefined
					? String(jobRole.capabilityId)
					: "Unknown"),
			band:
				jobRole.bandName ??
				(jobRole.bandId !== undefined ? String(jobRole.bandId) : "Unknown"),
			closingDate: this.mapClosingDate(jobRole.closingDate),
			status: this.mapStatus(jobRole),
			description: jobRole.description,
			responsibilities: jobRole.responsibilities,
			jobSpecUrl: jobRole.sharepointUrl ?? jobRole.jobSpecUrl,
			openPositions: jobRole.numberOfOpenPositions ?? jobRole.openPositions,
			addressLine1: jobRole.addressLine1,
			addressLine2: jobRole.addressLine2,
			postcode: jobRole.postcode,
		};
	}

	async getAll(jwtToken?: string): Promise<JobRole[]> {
		try {
			const response = jwtToken
				? await apiClient.get<ApiJobRole[]>("/job-roles", {
						headers: { Authorization: `Bearer ${jwtToken}` },
					})
				: await apiClient.get<ApiJobRole[]>("/job-roles");

			return response.data.map((jobRole) => this.mapJobRole(jobRole));
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				if (status === 404) {
					throw new Error("No job roles found");
				}
				if (status === 500) {
					throw new Error(
						"Job roles cannot be loaded right now. Please try again in a moment.",
					);
				}
			}

			throw error;
		}
	}

	async getById(jobRoleId: string, jwtToken?: string): Promise<JobRole> {
		try {
			const response = jwtToken
				? await apiClient.get<ApiJobRole>(`/job-roles/${jobRoleId}`, {
						headers: { Authorization: `Bearer ${jwtToken}` },
					})
				: await apiClient.get<ApiJobRole>(`/job-roles/${jobRoleId}`);

			return this.mapJobRole(response.data);
		} catch (error) {
			if (axios.isAxiosError(error)) {
				const status = error.response?.status;
				if (status === 404) {
					throw new Error(`Job role with ID ${jobRoleId} not found`);
				}
				if (status === 500) {
					throw new Error(
						"This job role cannot be loaded right now. Please try again in a moment.",
					);
				}
			}

			throw error;
		}
	}

	async createJobRole(
		jobRoleData: CreateJobRoleInput,
		jwtToken?: string,
	): Promise<void> {
		if (!jwtToken) {
			throw new Error("Not authenticated");
		}
		const payload = this.mapWritePayload(jobRoleData);

		await apiClient.post("/job-roles/create", payload, {
			headers: {
				Authorization: `Bearer ${jwtToken}`,
				"Content-Type": "application/json",
			},
		});
	}

	async updateJobRole(
		jobRoleData: UpdateJobRoleInput,
		jwtToken?: string,
	): Promise<void> {
		if (!jwtToken) {
			throw new Error("Not authenticated");
		}

		const { jobRoleId, ...editableFields } = jobRoleData;
		await apiClient.patch(
			`/job-roles/${jobRoleId}`,
			this.mapWritePayload(editableFields),
			{
				headers: {
					Authorization: `Bearer ${jwtToken}`,
					"Content-Type": "application/json",
				},
			},
		);
	}

	async applyForRole(
		jobRoleId: string,
		cvText: string,
		jwtToken?: string,
	): Promise<void> {
		if (!jwtToken) {
			throw new Error("Please sign in to continue");
		}

		await apiClient.post(
			`/job-roles/${jobRoleId}/apply`,
			{ cvText },
			{
				headers: { Authorization: `Bearer ${jwtToken}` },
			},
		);
	}

	//fetch status, band, capability, location options from the backend to populate the dropdown in the create job role form
	async getAllStatuses(): Promise<StatusOption[]> {
		try {
			const response = await apiClient.get<StatusOption[]>(
				"/job-roles/statuses",
			);
			return response.data;
		} catch {
			throw new Error("Failed to fetch job role statuses");
		}
	}

	async getAllLocations(): Promise<LocationOption[]> {
		try {
			const response = await apiClient.get<LocationOption[]>(
				"/job-roles/locations",
			);
			return response.data;
		} catch {
			throw new Error("Failed to fetch job role locations");
		}
	}

	async getAllCapabilities(): Promise<CapabilityOption[]> {
		try {
			const response = await apiClient.get<CapabilityOption[]>(
				"/job-roles/capabilities",
			);
			return response.data;
		} catch {
			throw new Error("Failed to fetch job role capabilities");
		}
	}

	async getAllBands(): Promise<BandOption[]> {
		try {
			const response = await apiClient.get<BandOption[]>("/job-roles/bands");
			return response.data;
		} catch {
			throw new Error("Failed to fetch job role bands");
		}
	}
}
