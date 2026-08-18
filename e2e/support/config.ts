import path from 'node:path';

export const backendDir = path.resolve(__dirname, '../../../team3-backend');
export const apiBaseURL = process.env.API_BASE_URL ?? 'http://localhost:4000';
