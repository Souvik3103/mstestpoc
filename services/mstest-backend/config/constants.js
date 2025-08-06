const path = require('path');

module.exports = {
  VSTEST_CONSOLE_PATH:
    "C:\\Program Files\\Microsoft Visual Studio\\2022\\Professional\\Common7\\IDE\\CommonExtensions\\Microsoft\\TestWindow\\vstest.console.exe",

  DEFAULT_PORT: 5000,

  TEST_DISCOVERY_DLL:
   path.join(__dirname, '..', '..', '..', 'binaries', 'Release', 'net9.0', 'testDiscovery.dll'),
};