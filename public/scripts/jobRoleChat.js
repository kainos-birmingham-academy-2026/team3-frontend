(() => {
	const panel = document.getElementById("job-chat-panel");
	const toggle = document.getElementById("job-chat-toggle");
	const close = document.getElementById("job-chat-close");
	const form = document.getElementById("job-chat-form");
	const input = document.getElementById("job-chat-input");
	const messages = document.getElementById("job-chat-messages");

	if (!panel || !toggle || !close || !form || !input || !messages) return;

	const setOpen = (isOpen) => {
		panel.hidden = !isOpen;
		toggle.setAttribute("aria-expanded", String(isOpen));
		toggle.setAttribute(
			"aria-label",
			isOpen ? "Close job role assistant" : "Open job role assistant",
		);
		if (isOpen) input.focus();
	};

	const addMessage = (text, sender, roles = []) => {
		const message = document.createElement("div");
		message.className = `job-chat-message job-chat-message-${sender}`;
		const body = document.createElement("p");
		body.textContent = text;
		message.append(body);

		roles.forEach((role) => {
			const link = document.createElement("a");
			link.href = `/job-role-list/${role.jobRoleId}`;
			link.textContent = `View ${role.roleName}`;
			message.append(link);
		});

		messages.append(message);
		messages.scrollTop = messages.scrollHeight;
		return message;
	};

	toggle.addEventListener("click", () => setOpen(panel.hidden));
	close.addEventListener("click", () => {
		setOpen(false);
		toggle.focus();
	});

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const question = input.value.trim();
		if (!question) return;

		addMessage(question, "user");
		input.value = "";
		input.disabled = true;
		const submitButton = form.querySelector("button[type='submit']");
		submitButton.disabled = true;
		const loadingMessage = addMessage("Finding role information...", "assistant");

		try {
			const response = await fetch("/api/job-role-chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: question }),
			});
			const data = await response.json();
			loadingMessage.remove();
			if (!response.ok) throw new Error(data.message);
			addMessage(data.answer, "assistant", data.roles);
		} catch (error) {
			loadingMessage.remove();
			addMessage(
				error instanceof Error && error.message
					? error.message
					: "The job role assistant is unavailable. Please try again later.",
				"assistant",
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