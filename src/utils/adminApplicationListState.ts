export interface AdminApplicationListState {
	page: number;
	search: string;
	status: "pending" | "approved" | "rejected" | "";
	role: string;
	location: string;
}

export function getAdminApplicationListUrl(
	state?: AdminApplicationListState,
): string {
	if (!state) {
		return "/job-applications/admin";
	}

	const params = new URLSearchParams();
	if (state.page > 1) params.set("page", String(state.page));
	if (state.search) params.set("search", state.search);
	if (state.status) params.set("status", state.status);
	if (state.role) params.set("role", state.role);
	if (state.location) params.set("location", state.location);

	const query = params.toString();
	return query ? `/job-applications/admin?${query}` : "/job-applications/admin";
}
