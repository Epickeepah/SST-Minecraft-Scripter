document.getElementById("version-text").textContent = web_version;
document.getElementById("mincraft-server-version").textContent =
  `Server Version: ${minecraft_server_version}`;
document.getElementById("mincraft-server-version-ui").textContent =
  `Server UI Version: ${minecraft_server_version_ui}`;

import {
  web_version,
  minecraft_server_version,
  minecraft_server_version_ui,
} from "./config.js";
