export function clean() {
	const folder = Folder.deleteDocuments(game.journal.directory.folders.map((f) => f.id));
	const content = JournalEntry.deleteDocuments(game.journal.contents.map((j) => j.id));
	Promise.allSettled([folder, content]).then((results) => {
		const failed = results.filter((r) => r.status === "rejected");
		if (failed.length > 0) {
			const error = failed[0].reason;
			ui.notifications.error(`Failed to clean Journal Directory. Open console for more details.`);
			throw new Error(error);
		}
		else ui.notifications.info(`Cleaned Journal Directory.`);
	});
}
