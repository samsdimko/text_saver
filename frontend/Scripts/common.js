import { isUserAuthorized, isRegisterPage, isLoginPage } from './auth.js';
import { bindEventListeners, initializeTextList, initializeTagList, initializeDictionary } from './eventHandlers.js';

export async function initializeCommon() {
  if (!(await isUserAuthorized()) && !(await isRegisterPage()) && !(await isLoginPage())) {
    window.location.href = '/templates/login.html';
  }
  
  bindEventListeners();
  await initializeTextList();
  await initializeTagList();
  await initializeDictionary();
}