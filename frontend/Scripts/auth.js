import { BASE_URL } from './config.js';
import { clearLocalStorage } from './storage.js';

export async function registerUser() {
  var login = document.getElementById("usernameField").value;
  var email = document.getElementById("emailField").value;
  var password = document.getElementById("passwordField").value;
  
  if (password.length < 5) {
    var messageContainer = document.getElementById('messageContainer');
    messageContainer.style.color = 'red';
    messageContainer.textContent = 'Password should be at least 5 characters long.';
    return;
  }

  var response = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      login: login,
      email: email,
      password: password
    })
  });
  if (response.ok === true) {
    var data = await response.json();
    if (data.message === 'User registered successfully') {
      var token = data.token;
      // Store the token in local storage or cookies for future authenticated requests
      localStorage.setItem('token', token);
      window.location.href = '/templates/popup.html'
    } else if (data.message === 'User with this login is already registered') {
      var messageContainer = document.getElementById('messageContainer');
      messageContainer.style.color = 'red';
      messageContainer.textContent = 'User with this login is already registered';
    } else if (data.message === 'User with this email is already registered') {
      var messageContainer = document.getElementById('messageContainer');
      messageContainer.style.color = 'red';
      messageContainer.textContent = 'User with this email is already registered';
    }
  } else {
    var error = await response.json();
    console.error('Error registering user:', error.message);
    // Handle the registration error
  }
}

export async function loginUser() {
  var loginInput = document.getElementById("usernameField").value;
  var passwordInput = document.getElementById("passwordField").value;

  var userData = {
    login: loginInput,
    password: passwordInput
  };
  fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  })
    .then(response => {
      if (response.ok === true) {
        return response.json();
      } else {
        throw new Error('Login failed with status: ' + response.status);
      }
    })
    .then(data => {
      var token = data.token;
      var tags = data.tags;
      storeUserTags(tags);
      localStorage.setItem('token', token);
      window.location.href = '/templates/popup.html';
    })
    .catch(error => {
      console.error('Login error:', error);
      var errorMessage = document.getElementById("errorMessage");
      errorMessage.textContent = 'Login failed. Please try again.';
    });
}

export async function userLogout() {
  const token = localStorage.getItem('token');

  fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then(response => {
      if (response.ok) {
        localStorage.removeItem('token');
        clearLocalStorage();
        window.location.href = '/templates/login.html';
      } else {
        throw new Error('Logout failed');
      }
    })
    .catch(error => {
      console.error('Logout error:', error);
    });
}

export async function isUserAuthorized() {
  const token = localStorage.getItem('token');
  if (!token) {
    return false; 
  }
  try {
    const response = await fetch(`${BASE_URL}/check-authorization`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.ok === true) {
      return true; // User is authorized
    } else if (response.status === 401) {
      return false; // User is not authorized
    } else {
      throw new Error('Failed to check authorization');
    }
  } catch (error) {
    console.error(error);
    return false; // User is not authorized
  }
}

export function isRegisterPage() {
  return window.location.pathname === '/templates/register.html';
}

export function isLoginPage() {
  return window.location.pathname === '/templates/login.html';
}

