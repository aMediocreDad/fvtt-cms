# Foundry VTT Content Management System

This is a simple content management system for the Foundry VTT. At the moment it only supports exporting and importing HTML files in a folder structure.

> **Note:** This module is only usable in **Chrome** due to its reliance on the `Filesystem Access` API.

Given a folder of HTML files, this module will import them into Foundry VTT. It can also export the current content of the Foundry VTT to a folder of HTML files.

## Usage

Upon activation in a `world` a modal on the bottom left is displayed, containing three buttons.

-   `Export Journals`: Exports the current content of the `world`'s Journal Directory to the selected folder.
-   `Import Journals`: Imports the selected folder of HTML files into the current `world`'s Journal Directory.
-   `Clean`: Deletes all folders and journal entries in the `world`'s Journal Directory.

### Importing

Only the HTML files in the selected folder will be imported. The `root` (selected directory) will not be imported, however, the rest of the folder structure will be preserved.

**Example:**

```
# Selected folder: /Users/<user>/Desktop/Journals/

Journals <root>
├── Folder 1
│   ├── Journal 1.html
│   ├── Journal 2.html
│   └── Journal 3.html
├── Folder 2
│   ├── Journal 4.html
│   └── Journal 5.html
└── Journal 6.html
```

Will result the following structure in the `world`'s Journal Directory:

```
Folder 1
├── Journal 1.html
├── Journal 2.html
└── Journal 3.html
Folder 2
├── Journal 4.html
└── Journal 5.html
Journal 6.html
```

#### File prelude:

To successfully import a directory of HTML files, it is vital that each HTML file has a prelude:

```html
<script type="application/json">
	{
	  "name": "JSON escaped name",
	  "img"?: "path to image",
	  "permission"?: "Default permission value"
	  "sort"?: sort value,
	  "id"?: "id of journal entry"
	}
</script>
```

Only the name is required. The rest of the fields are optional.

The rest of the file will become the content of the journal entry.

#### Folder metadata:

It is also possible to specify metadata used in the creation of the folder in Foundry as well. This is done by adding a `__meta.json` file to the folder.

```json
{
  "name?": "JSON escaped name",
  "sorting?": "a" or "m",
  "sort?": sort value,
  "color?": "color value"
}
```
