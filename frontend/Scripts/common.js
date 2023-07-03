import { isUserAuthorized, isRegisterPage, isLoginPage } from './auth.js';
import { bindEventListeners, initializeTextList, initializeTagList } from './eventHandlers.js';
import { fetchAndStoreDefaultTags } from './api.js'

export async function initializeCommon() {
  if (!(await isUserAuthorized()) && !(await isRegisterPage()) && !(await isLoginPage())) {
    window.location.href = '/templates/login.html';
  }

  bindEventListeners();
  await initializeTextList();
  await initializeTagList();
  await fetchAndStoreDefaultTags();
}