import { initializeCommon } from './common.js';

(async function() {
  document.addEventListener('DOMContentLoaded', async function() {
    await initializeCommon();
  });
})();