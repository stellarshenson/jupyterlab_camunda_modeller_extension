"""Server configuration for integration tests.

!! Never use this configuration in production because it
opens the server to the world and provide access to JupyterLab
JavaScript objects through the global window variable.
"""
import os
from tempfile import mkdtemp

from jupyterlab.galata import configure_jupyter_server

configure_jupyter_server(c)

# Keep the developer's ~/.jupyter/lab/user-settings out of reach of the tests.
c.LabApp.user_settings_dir = mkdtemp(prefix="galata-settings-")

# The port is shared with playwright.config.js; `or` treats an empty value as unset.
c.ServerApp.port = int(os.environ.get("JUPYTER_TEST_PORT") or "8888")

# A startup tab other than the Launcher hangs Galata; ignored where the extension is absent.
c.GalaxaHubMotd.open_on_start = False

# Delete test files for good: the temporary root has no writable trash folder.
# The server uses AsyncLargeFileManager; a jupyter config that sets the option
# on that class outranks the base-class line, so set both.
c.FileContentsManager.delete_to_trash = False
c.AsyncLargeFileManager.delete_to_trash = False

# Uncomment to set server log level to debug level
# c.ServerApp.log_level = "DEBUG"
