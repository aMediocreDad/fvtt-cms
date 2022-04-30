import { writeJournals } from "./module/export.js";
import { importHTMLToJournal } from "./module/import.js";
import { clean } from "./module/clean.js";

Hooks.on("init", () => {
	CONFIG.CMS = {
		writeJournals,
		importHTMLToJournal,
		clean,
	};
});

Hooks.on("ready", () => {
	const modal = document.createElement("div");
	const buttons = `<div id="fvtt-cms-content">
			<button id="fvtt-cms-tab-export">Export Journals</button>
			<button id="fvtt-cms-tab-import">Import Journals</button>
			<button id="fvtt-cms-tab-clean">Clean Journal Directory</button>
		</div>
	`;
	modal.id = "fvtt-cms-container";
	modal.innerHTML = `<div id="fvtt-cms-header">
		<h2>FVTT Content Management System</h2>
		</div>
		${!!window.chrome ? buttons : "<p>This module only works in Chromium-based browsers (e.g. Chrome, Edge, Brave).</p>"}
	`;
	document.body.appendChild(modal);
	modal.addEventListener("click", async (e) => {
		if (e.target.id === "fvtt-cms-tab-import") importHTMLToJournal();
		else if (e.target.id === "fvtt-cms-tab-export") writeJournals();
		else if (e.target.id === "fvtt-cms-tab-clean") {
			await Dialog.confirm({
				title: "Clean Journal Directory",
				content: "<p>Are you sure you want to delete all journals in the Journal tab? <strong>This cannot be undone.</strong></p>",
				defaultYes: false,
				yes: () => clean(),
				no: () => ui.notifications.warn("Aborted cleaning journal directory."),
			});
		}
	});
});
