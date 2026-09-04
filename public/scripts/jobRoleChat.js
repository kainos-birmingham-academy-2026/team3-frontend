(() => {
	const HISTORY_STORAGE_KEY = "jobRoleChatHistory";
	const MAX_HISTORY_MESSAGES = 20;
	const panel = document.getElementById("job-chat-panel");
	const toggle = document.getElementById("job-chat-toggle");
	const close = document.getElementById("job-chat-close");
	const form = document.getElementById("job-chat-form");
	const input = document.getElementById("job-chat-input");
	const characterCount = document.getElementById("job-chat-character-count");
	const messages = document.getElementById("job-chat-messages");

	if (
		!panel ||
		!toggle ||
		!close ||
		!form ||
		!input ||
		!characterCount ||
		!messages
	)
		return;

	const updateCharacterCount = () => {
		characterCount.textContent = `${input.value.length} / ${input.maxLength} characters`;
	};

	const isStoredRole = (role) =>
		role &&
		Number.isInteger(role.jobRoleId) &&
		typeof role.roleName === "string" &&
		typeof role.location === "string" &&
		typeof role.status === "string" &&
		Number.isInteger(role.openPositions) &&
		(role.closingDate === null || typeof role.closingDate === "string");

	const readHistory = () => {
		try {
			const storedHistory = JSON.parse(
				sessionStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]",
			);
			if (!Array.isArray(storedHistory)) return [];

			return storedHistory
				.filter(
					(entry) =>
						entry &&
						["user", "assistant"].includes(entry.sender) &&
						typeof entry.text === "string" &&
						entry.text.length <= 2000 &&
						Array.isArray(entry.roles) &&
						entry.roles.length <= 3 &&
						entry.roles.every(isStoredRole),
				)
				.slice(-MAX_HISTORY_MESSAGES);
		} catch {
			return [];
		}
	};

	let history = readHistory();
	const saveMessage = (text, sender, roles) => {
		history = [...history, { text, sender, roles }].slice(
			-MAX_HISTORY_MESSAGES,
		);
		try {
			sessionStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
		} catch {
			// Storage can be unavailable in privacy-restricted browser contexts.
		}
	};

	const setOpen = (isOpen) => {
		panel.hidden = !isOpen;
		toggle.setAttribute("aria-expanded", String(isOpen));
		toggle.setAttribute(
			"aria-label",
			isOpen ? "Close job role assistant" : "Open job role assistant",
		);
		if (isOpen) input.focus();
	};

	const addMessage = (text, sender, roles = [], persist = false) => {
		const message = document.createElement("div");
		message.className = `job-chat-message job-chat-message-${sender}`;
		const body = document.createElement("p");
		body.textContent = text;
		message.append(body);

		const roleResults = document.createElement("div");
		roleResults.className = "job-chat-role-results";

		roles.forEach((role) => {
			const result = document.createElement("article");
			result.className = "job-chat-role-result";
			const heading = document.createElement("div");
			heading.className = "job-chat-role-heading";
			const link = document.createElement("a");
			link.href = `/job-role-list/${role.jobRoleId}`;
			link.textContent = role.roleName;
			heading.append(link);
			const status = document.createElement("span");
			status.className = "job-chat-role-status";
			status.textContent = role.status;
			heading.append(status);
			result.append(heading);

			const facts = document.createElement("p");
			facts.className = "job-chat-role-facts";
			const closingDate = role.closingDate
				? new Intl.DateTimeFormat("en-GB", {
						day: "numeric",
						month: "short",
						year: "numeric",
					}).format(new Date(role.closingDate))
				: "No closing date";
			const positions = `${role.openPositions} ${role.openPositions === 1 ? "position" : "positions"}`;
			facts.textContent = `${role.location} · ${positions} · Closes ${closingDate}`;
			result.append(facts);
			roleResults.append(result);
		});

		if (roles.length > 0) {
			message.append(roleResults);
			const guidance = document.createElement("p");
			guidance.className = "job-chat-role-guidance";
			guidance.append("To see more roles, visit the ");
			const allRolesLink = document.createElement("a");
			allRolesLink.href = "/job-role-list";
			allRolesLink.textContent = "job roles page";
			guidance.append(allRolesLink, ".");
			message.append(guidance);
		}

		messages.append(message);
		messages.scrollTop = messages.scrollHeight;
		if (persist) saveMessage(text, sender, roles);
		return message;
	};

	history.forEach(({ text, sender, roles }) => {
		addMessage(text, sender, roles);
	});

	toggle.addEventListener("click", () => setOpen(panel.hidden));
	input.addEventListener("input", updateCharacterCount);
	close.addEventListener("click", () => {
		setOpen(false);
		toggle.focus();
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const question = input.value.trim();
		if (!question) return;

		addMessage(question, "user", [], true);
		input.value = "";
		updateCharacterCount();
		input.disabled = true;
		const submitButton = form.querySelector("button[type='submit']");
		submitButton.disabled = true;
		const loadingMessage = addMessage(
			"Finding role information...",
			"assistant",
		);

		try {
			const response = await fetch("/api/job-role-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: question }),
			});
			const data = await response.json();
			loadingMessage.remove();
			if (!response.ok) throw new Error(data.message);
			addMessage(data.answer, "assistant", data.roles, true);
		} catch (error) {
			loadingMessage.remove();
			addMessage(
				error instanceof Error && error.message
					? error.message
					: "The job role assistant is unavailable. Please try again later.",
				"assistant",
				[],
				true,
			);
		} finally {
			input.disabled = false;
			submitButton.disabled = false;
			input.focus();
		}
	});

	document.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && !panel.hidden) {
			setOpen(false);
			toggle.focus();
		}
	});
})();
