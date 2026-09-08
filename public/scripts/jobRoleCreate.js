(() => {
	for (const characterCount of document.querySelectorAll(
		"[data-character-count-for]",
	)) {
		const input = document.getElementById(
			characterCount.dataset.characterCountFor,
		);

		if (!input || input.maxLength < 0) continue;

		const updateCharacterCount = () => {
			characterCount.textContent = `${input.value.length} / ${input.maxLength} characters`;
		};

		input.addEventListener("input", updateCharacterCount);
		updateCharacterCount();
	}
})();
