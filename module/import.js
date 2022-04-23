const titleCase = (str) =>
	str.charAt(0).toUpperCase() +
	str
		.slice(1)
		.replace(/-+([0-9a-z])/g, (_, g) => ` ${g.toUpperCase()}`)
		.trim();

const safeParse = (str) => {
	try {
		return JSON.parse(str, (k, v) => {
			switch (v) {
				case "true":
					return true;
				case "false":
					return false;
				case "null":
					return null;
				case "undefined":
					return undefined;
				default:
					return v;
			}
		});
	} catch (e) {
		console.error("Failed to parse JSON: ", e, "See string below:\n");
		console.warn(str);
		return {};
	}
};

const getFolderMetaData = async (directory) => {
	try {
		const fileHandle = await directory.getFileHandle("__meta.json");
		const metaFile = await fileHandle.getFile();
		return safeParse(await metaFile.text());
	} catch (error) {
		console.error("Failed to read directory metadata: ", error);
		return {};
	}
};

export async function importHTMLToJournal() {
	const rootHandle = await window.showDirectoryPicker();
	rootHandle.requestPermission({ readable: true });
	rootHandle.root = true;

	async function readFiles(directory, parentId = null) {
		let folder;
		const fallBackName = titleCase(directory.name);
		if (!directory.root)
			try {
				const { name, sorting = "a", sort = null, color } = await getFolderMetaData(directory);
				const createdDir = await Folder.create({
					name: name || fallBackName,
					sorting,
					sort,
					color,
					parent: parentId,
					type: "JournalEntry",
				});
				folder = createdDir.id || null;
				console.log(`Created directory ${directory.name}`);
			} catch (error) {
				console.error("Failed to read and create directory: ", error);
				folder = parentId;
			}

		const fileNames = directory.entries();
		for await (const [key, value] of fileNames) {
			if (value.kind === "directory") await readFiles(value, folder);
			else if (key.endsWith(".html")) {
				try {
					const file = await value.getFile();
					const text = await file.text();
					const content = text.replace(/<script type="application\/json">([\s\S]*)<\/script>/, "");
					const meta = text.match(/<script type="application\/json">([\s\S]*)<\/script>/)[1];
					if (!meta) {
						console.error(`Failed to read meta data for ${key}`);
						continue;
					}
					const metaData = safeParse(meta);
					const { name, img = null, permission, sort, id } = metaData;
					if (!name) continue;
					entries.push({ name, img, [permission]: { default: permission }, sort, id, folder, content });
				} catch (error) {
					console.error("Failed to read file: ", error);
				}
			}
		}
	}

	ui.notifications.notify("Importing HTML to Journal...");
	console.time("importHTMLToJournal");

	let entries = [];
	await readFiles(rootHandle).catch((error) => {
		ui.notifications.error(`Failed to read Files. Open console for more details.`);
		throw error;
	});

	await JournalEntry.createDocuments(entries, { keepId: true })
		.catch((error) => {
			ui.notifications.error(`Failed to create journal entries. Open console for more details.`);
			throw error;
		})
		.then((result) => {
			console.log(`Created ${result.length} entries.`);
		});

	console.timeEnd("importHTMLToJournal");
	ui.notifications.notify("Finished importing journals.");
}
