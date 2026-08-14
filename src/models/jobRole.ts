export interface JobRole {
  jobRoleId: number;
  roleName: string;
  location: string;
  capability: string;
  band: string;
  closingDate: string;
  status: string;
  description?: string;
  responsibilities?: string;
  jobSpecUrl?: string;
  openPositions?: number;
  addressLine1?: string;
  addressLine2?: string;
  postcode?: string;
}

export interface CreateJobRoleInput {
  roleName?: string;
  description?: string;
  responsibilities?: string;
  sharepointUrl?: string;
  numberOfOpenPositions?: string | number;
  closingDate?: string;
  capabilityId?: string | number;
  bandId?: string | number;
  locationId?: string | number;
}

export interface StatusOption {
  statusId: number;
  statusName: string;
}

export interface LocationOption {
  locationId: number;
  locationName: string;
}

export interface CapabilityOption {
  capabilityId: number;
  capabilityName: string;
}

export interface BandOption {
  bandId: number;
  bandName: string;
}

export interface SchemaError {
  field?: string;
  message: string;
}
