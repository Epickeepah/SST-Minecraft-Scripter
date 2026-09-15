function loadSoundCreation() {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  const uuid3 = crypto.randomUUID();

  document.getElementById("uuid1").value = uuid1;
  document.getElementById("uuid2").value = uuid2;
}

function createManifest() {
  const packName = document.getElementById("pack-name").value.trim();
  const packDescription = document.getElementById("pack-description").value;

  const uuid1 = document.getElementById("uuid1").value;
  const uuid2 = document.getElementById("uuid2").value;

  if (!packName) {
    alert("Please enter a Pack Name!");
    return;
  }

  const manifest = `{
    "format_version": 2,
    "header": {
        "name": "${packName}",
        "description": "${packDescription}",
        "uuid": "${uuid1}",
        "version": [
            1,
            0,
            0
        ],
        "min_engine_version": [
            1,
            21,
            0
        ]
    },
    "modules": [
        {
            "type": "resources",
            "uuid": "${uuid2}",
            "version": [
                1,
                0,
                0
            ]
        }
    ]
}`;

  console.log(manifest);

  document.getElementById("manifest-output").value = manifest;

  // Start file creation
}

async function createAddonFiles(packName, manifest) {
  try {
    console.log("1. Opening folder picker...");

    const directoryHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    console.log("2. Folder selected!");
    console.log("Parent folder:", directoryHandle.name);

    // Make sure we have permission to write
    const permission = await directoryHandle.requestPermission({
      mode: "readwrite",
    });

    console.log("3. Permission:", permission);

    if (permission !== "granted") {
      alert("Write permission was not granted.");
      return;
    }

    console.log("4. Creating addon folder:", packName);

    const addonFolder = await directoryHandle.getDirectoryHandle(packName, {
      create: true,
    });

    console.log("5. Addon folder created:", addonFolder.name);

    console.log("6. Creating manifest.json...");

    const manifestFile = await addonFolder.getFileHandle("manifest.json", {
      create: true,
    });

    console.log("7. manifest.json handle created.");

    console.log("8. Writing manifest...");

    const writable = await manifestFile.createWritable();

    await writable.write(manifest);

    console.log("9. Data written.");

    await writable.close();

    console.log("10. File closed.");

    // Verify that the file actually exists
    const testFile = await addonFolder.getFileHandle("manifest.json");

    const file = await testFile.getFile();

    console.log("11. VERIFIED FILE:");
    console.log("Name:", file.name);
    console.log("Size:", file.size);
    console.log("Type:", file.type);

    alert(
      `SUCCESS!\n\nCreated:\n${packName}\\manifest.json\n\nSize: ${file.size} bytes`,
    );
  } catch (error) {
    console.error("CREATE FAILED:", error);
    console.error("Name:", error.name);
    console.error("Message:", error.message);

    alert(`Failed to create addon:\n${error.name}\n${error.message}`);
  }
}
