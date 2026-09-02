const passwordField = document.querySelector("#password");
const confirmPasswordField = document.querySelector("#confirmPassword");
const passwordRules = {
	length: (password) => password.length >= 9,
	case: (password) => /[A-Z]/.test(password) && /[a-z]/.test(password),
	special: (password) => /[^A-Za-z0-9]/.test(password),
	matching: (password, confirmPassword) =>
		password.length > 0 && password === confirmPassword,
};

function updatePasswordRequirements(password, confirmPassword) {
	for (const [rule, isMet] of Object.entries(passwordRules)) {
		const requirement = document.querySelector(
			`[data-password-rule="${rule}"]`,
		);
		const icon = requirement?.querySelector(".requirement-icon");
		const met = isMet(password, confirmPassword);

		if (requirement && icon) {
			requirement.dataset.met = String(met);
			icon.textContent = met ? "✓" : "✕";
		}
	}
}

if (
	passwordField instanceof HTMLInputElement &&
	confirmPasswordField instanceof HTMLInputElement
) {
	const updateRequirements = () => {
		updatePasswordRequirements(passwordField.value, confirmPasswordField.value);
	};

	passwordField.addEventListener("input", () => {
		updateRequirements();
	});
	confirmPasswordField.addEventListener("input", () => {
		updateRequirements();
	});
}

for (const toggle of document.querySelectorAll(".password-toggle")) {
	toggle.addEventListener("click", () => {
		const fieldId = toggle.getAttribute("aria-controls");
		const field = fieldId ? document.getElementById(fieldId) : null;

		if (!(field instanceof HTMLInputElement)) {
			return;
		}

		const showPassword = field.type === "password";
		field.type = showPassword ? "text" : "password";
		const fieldName =
			fieldId === "confirmPassword" ? "confirm password" : "password";
		toggle.setAttribute(
			"aria-label",
			`${showPassword ? "Hide" : "Show"} ${fieldName}`,
		);
		toggle.setAttribute("aria-pressed", String(showPassword));
	});
}
