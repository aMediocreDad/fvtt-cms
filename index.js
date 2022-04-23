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
	modal.id = "fvtt-cms-container";
	modal.innerHTML = `
	<div id="fvtt-cms-header">
		<h2>FVTT Content Management System</h2>
	</div>
	<div id="fvtt-cms-content">
		<button id="fvtt-cms-tab-export">Export Journals </button>
		<button id="fvtt-cms-tab-import">Import Journals</button>
		<button id="fvtt-cms-tab-clean">Clean Journal Directory</button>
	</div>`;
	document.body.appendChild(modal);
	modal.addEventListener("click", (e) => {
		if (e.target.id === "fvtt-cms-tab-import") {
			importHTMLToJournal();
		} else if (e.target.id === "fvtt-cms-tab-export") {
			writeJournals();
		} else if (e.target.id === "fvtt-cms-tab-clean") {
			clean();
		}
	});
});