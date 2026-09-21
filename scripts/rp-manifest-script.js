document
  .getElementById("manifest-button")
  .addEventListener("click", createManifest);

loadSoundCreation();
document.getElementById("copy-button").addEventListener("click", copyManifest);
document.getElementById("version-text").textContent = web_version;

import {
  web_version,
  minecraft_server_version,
  minecraft_server_version_ui,
} from "./config.js";

function loadSoundCreation() {
  const uuid1 = crypto.randomUUID();
  const uuid2 = crypto.randomUUID();
  //const uuid3 = crypto.randomUUID();

  document.getElementById("uuid1").value = uuid1;
  document.getElementById("uuid2").value = uuid2;
  // document.getElementById("uuid3").value = uuid3;
}

let currentPackName = "";
let currentManifest = "";

function createManifest() {
  const packName = document.getElementById("pack-name").value.trim();
  const packDescription = document.getElementById("pack-description").value;
  const uuid1 = document.getElementById("uuid1").value;
  const uuid2 = document.getElementById("uuid2").value;
  //const uuid3 = document.getElementById("uuid3").value;

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

function copyManifest() {
  const text = document.getElementById("manifest-output").value;

  navigator.clipboard.writeText(text);
  console.log(text);
}
