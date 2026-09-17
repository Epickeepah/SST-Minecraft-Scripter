function loadSoundCreation() {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  const uuid3 = crypto.randomUUID();

  document.getElementById("uuid1").value = uuid1;
  document.getElementById("uuid2").value = uuid2;
}

let currentPackName = "";

function createManifest() {
  const packName = document.getElementById("pack-name").value.trim();
  const packDescription = document.getElementById("pack-description").value;
  const uuid1 = document.getElementById("uuid1").value;
  const uuid2 = document.getElementById("uuid2").value;

  currentPackName = packName;

  if (!packName) {
    document.getElementById("pack-name").focus();
    return;
  }

  currentManifest = `{
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

  console.log("Manifest created:");
  console.log(currentManifest);

  document.getElementById("manifest-output").value = currentManifest;
}

async function createAddonFiles(
  packName,
  manifest,
  soundJson,
  soundDefJson,
  soundFiles,
) {
  try {
    console.log("1. Opening folder picker...");

    const directoryHandle = await window.showDirectoryPicker({
      mode: "readwrite",
    });

    console.log("2. Folder selected!");
    console.log("Parent folder:", directoryHandle.name);

    // ==========================================================
    // PERMISSION
    // ==========================================================

    const permission = await directoryHandle.requestPermission({
      mode: "readwrite",
    });

    console.log("3. Permission:", permission);

    if (permission !== "granted") {
      alert("Write permission was not granted.");
      return;
    }

    // ==========================================================
    // ADDON FOLDER
    // ==========================================================

    console.log("4. Creating addon folder:", packName);

    const addonFolder = await directoryHandle.getDirectoryHandle(packName, {
      create: true,
    });

    console.log("5. Addon folder created:", addonFolder.name);

    // ==========================================================
    // MANIFEST.JSON
    // ==========================================================

    console.log("6. Creating manifest.json...");

    const manifestFile = await addonFolder.getFileHandle("manifest.json", {
      create: true,
    });

    const manifestWritable = await manifestFile.createWritable();

    const manifestData =
      typeof manifest === "string"
        ? manifest
        : JSON.stringify(manifest, null, 2);

    await manifestWritable.write({
      type: "write",
      position: 0,
      data: manifestData,
    });

    await manifestWritable.close();

    console.log("7. manifest.json created.");

    // ==========================================================
    // SOUNDS FOLDER
    // ==========================================================

    console.log("8. Creating sounds folder...");

    const soundsFolder = await addonFolder.getDirectoryHandle("sounds", {
      create: true,
    });

    console.log("9. sounds folder created.");

    // ==========================================================
    // RANDOM FOLDER
    // ==========================================================

    console.log("10. Creating sounds/random folder...");

    const randomFolder = await soundsFolder.getDirectoryHandle("random", {
      create: true,
    });

    console.log("11. sounds/random folder created.");

    // ==========================================================
    // OGG SOUND FILES
    // ==========================================================

    console.log("12. Creating sound files...");

    for (const file of soundFiles) {
      console.log("Creating sound:", file.name);

      const soundFile = await randomFolder.getFileHandle(file.name, {
        create: true,
      });

      const soundWritable = await soundFile.createWritable();

      const soundData = await file.arrayBuffer();

      await soundWritable.write({
        type: "write",
        position: 0,
        data: soundData,
      });

      await soundWritable.close();

      console.log("Created sound:", file.name);
    }

    // ==========================================================
    // SOUND.JSON
    // ==========================================================

    console.log("13. Creating sound.json...");

    const soundJsonFile = await addonFolder.getFileHandle("sounds.json", {
      create: true,
    });

    const soundJsonWritable = await soundJsonFile.createWritable();

    const soundJsonData = JSON.stringify(soundJson, null, 2);

    await soundJsonWritable.write({
      type: "write",
      position: 0,
      data: soundJsonData,
    });

    await soundJsonWritable.close();

    console.log("14. sound.json created.");

    // ==========================================================
    // SOUND_DEFINITIONS.JSON
    // ==========================================================

    console.log("15. Creating sound_definitions.json...");

    const soundDefFile = await soundsFolder.getFileHandle(
      "sound_definitions.json",
      {
        create: true,
      },
    );

    const soundDefWritable = await soundDefFile.createWritable();

    const soundDefData = JSON.stringify(soundDefJson, null, 2);

    await soundDefWritable.write({
      type: "write",
      position: 0,
      data: soundDefData,
    });

    await soundDefWritable.close();

    console.log("16. sound_definitions.json created.");

    // ==========================================================
    // DONE
    // ==========================================================

    console.log("17. ADDON CREATION COMPLETE!");

    alert(
      `SUCCESS!\n\n` +
        `Created:\n${packName}\n\n` +
        `manifest.json\n` +
        `sounds/sound.json\n` +
        `sounds/sound_definitions.json\n` +
        `sounds/random/${soundFiles.length} sound(s)`,
    );
  } catch (error) {
    console.error("CREATE FAILED:", error);
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);

    alert(
      `Failed to create addon:\n\n` + `${error.name}\n` + `${error.message}`,
    );
  }
}

async function createAddonFilesMCAddon(
  packName,
  manifest,
  soundJson,
  soundDefJson,
  soundFiles,
) {
  try {
    const zip = new JSZip();
    const addonFolder = zip.folder(packName);

    // manifest.json
    addonFolder.file("manifest.json", manifest);

    // sound.json (next to manifest, per your last change)
    addonFolder.file("sounds.json", JSON.stringify(soundJson, null, 2));

    // sounds folder
    const soundsFolder = addonFolder.folder("sounds");
    soundsFolder.file(
      "sound_definitions.json",
      JSON.stringify(soundDefJson, null, 2),
    );

    // sounds/random folder with actual sound files
    const randomFolder = soundsFolder.folder("random");
    for (const file of soundFiles) {
      const arrayBuffer = await file.arrayBuffer();
      randomFolder.file(file.name, arrayBuffer);
    }

    // Generate the zip as a blob
    const blob = await zip.generateAsync({ type: "blob" });

    // Trigger download as .mcaddon
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${packName}.mcaddon`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    alert(`SUCCESS!\n\nDownloaded ${packName}.mcaddon`);
  } catch (error) {
    console.error("CREATE FAILED:", error);
    alert(`Failed to create addon:\n\n${error.name}\n${error.message}`);
  }
}

let collectedSoundFiles = [];

function isOggFile(file) {
  const hasOggExtension = /\.ogg$/i.test(file.name);
  const hasOggMime = file.type === "audio/ogg" || file.type === "";
  return hasOggExtension && hasOggMime;
}

function setupSoundDropArea() {
  const dropArea = document.getElementById("sound-drop-area");

  if (!dropArea) {
    console.error("sound-drop-area was not found!");
    return;
  }

  console.log("Sound drop area loaded.");

  dropArea.addEventListener("dragenter", (event) => {
    event.preventDefault();
    event.stopPropagation();

    console.log("Drag entered!");

    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Tell the browser this is a copy operation
    event.dataTransfer.dropEffect = "copy";

    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", (event) => {
    event.preventDefault();
    event.stopPropagation();

    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", async (event) => {
    event.preventDefault();
    event.stopPropagation();

    dropArea.classList.remove("drag-over");

    const files = [...event.dataTransfer.files];
    const rejected = [];

    for (const file of files) {
      if (!isOggFile(file)) {
        rejected.push(file.name);
        continue;
      }

      collectedSoundFiles.push(file);
      await createSoundJson(file.name);
      await createSoundDefJson(file.name);
    }

    if (rejected.length > 0) {
      alert(
        `Skipped non-.ogg file(s):\n${rejected.join("\n")}\n\nMinecraft only supports OGG Vorbis audio.`,
      );
    }
  });
}

// Create sounds.json

let soundJson = {};

async function createSoundJson(fileName) {
  console.log("Creating sound.json for:", fileName);

  const output = document.getElementById("sound-json-output");

  const soundName = fileName.replace(/\.[^/.]+$/, "");

  soundJson[soundName] = {
    category: "ambient",
    sounds: [`sounds/random/${soundName}`],
  };

  if (output) {
    output.value = JSON.stringify(soundJson, null, 2);
  }

  console.log("sound.json:", soundJson);
}

let soundDefJson = {
  format_version: "1.20.20",
  sound_definitions: {},
};

// Create sound_definitions.json

async function createSoundDefJson(fileName) {
  console.log("Creating sound_definitions.json for:", fileName);

  const output = document.getElementById("sound-def-json-output");

  const soundName = fileName.replace(/\.[^/.]+$/, "");

  soundDefJson.sound_definitions[`random.${soundName}`] = {
    category: "neutral",
    sounds: [`sounds/random/${soundName}`],
  };

  if (output) {
    output.value = JSON.stringify(soundDefJson, null, 2);
  }

  console.log("sound_definitions.json:", soundDefJson);
}
