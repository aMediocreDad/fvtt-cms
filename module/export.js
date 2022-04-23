const sanitizeName = (name) =>
	name.toLowerCase().replace(/[^0-9a-z.]/g, (c) => {
		if (c === " ") return "-";
		return "";
	});

const JSONEscape = (str) => str.replace(/["]/g, (c) => `\\${c}`);

const createFileMetaData = (data) => {
	const {
		name,
		img,
		permission: { default: permission },
		sort,
		_id: id,
	} = data;
	return `<script type="application/json">
{
"name": "${JSONEscape(name)}",
"img": "${img}",
"permission": "${permission}",
"sort": ${sort},
"id": "${id}"
}
</script>
`;
};

const writeFolderMetaData = async ({ name, sorting, sort, color }, dirHandle) => {
	const content = JSON.stringify({
		name,
		sorting,
		sort,
		color,
	});
	try {
		const fhandle = await dirHandle.getFileHandle("__meta.json", { create: true });
		const writable = await fhandle.createWritable();
		await writable.write(content);
		await writable.close();
	} catch (error) {
		console.error("Failed to write directory metadata", error);
	}
};

export async function writeJournals() {
	const rootHandle = await window.showDirectoryPicker();
	rootHandle.requestPermission({ writable: true });

	async function writeFile(file, directory) {
		const fileName = sanitizeName(file.name);
		const fileMeta = createFileMetaData(file.data);
		const fileContent = `${fileMeta}${file.data.content}`;
		try {
			const fhandle = await directory.getFileHandle(`${fileName}.html`, { create: true });
			const writable = await fhandle.createWritable();
			await writable.write(fileContent);
			await writable.close();
			console.log(`Wrote ${fileName}.html`);
		} catch (e) {
			console.error("Failed to save file", e);
		}
	}

	async function createDir(dirName, dirHandle) {
		try {
			return dirHandle.getDirectoryHandle(sanitizeName(dirName), { create: true });
		} catch (e) {
			console.error("Failed to create directory: ", e);
			return dirHandle;
		}
	}

	async function write(tree, directory) {
		for (const dir of tree.children) {
			const dirHandle = await createDir(dir.name, directory);
			writeFolderMetaData(dir.data, dirHandle);
			console.log(`Created directory ${dir.name}`);
			await write(dir, dirHandle);
		}
		for (const file of tree.content) {
			await writeFile(file, directory);
		}
	}

	ui.notifications.notify("Exporting Journals...");
	console.time("writeJournals");

	// Get Journal tree:
	const rootTree = game.journal.directory.tree;
	// Start recurse write
	await write(rootTree, rootHandle).catch((error) => {
		ui.notifications.error(`Failed to export Journal Entries. Open console for more details.`);
		throw error;
	});

	console.timeEnd("writeJournals");
	ui.notifications.notify("Finished exporting journals.");
}
