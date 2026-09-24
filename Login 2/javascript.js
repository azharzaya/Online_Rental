const USERS_KEY = 'estate_users';
const CURRENT_USER_KEY = 'estate_current_user';

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
  } catch {
    return null;
  }
}

function clearCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

function showSignup() {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("signupForm").classList.add("active");
  document.getElementById("accountBox").style.display = 'none';
}

function showLogin() {
  document.getElementById("signupForm").classList.remove("active");
  document.getElementById("loginForm").classList.add("active");
  document.getElementById("accountBox").style.display = 'none';
}

function showAccount(user) {
  document.getElementById("loginForm").classList.remove("active");
  document.getElementById("signupForm").classList.remove("active");
  const accountBox = document.getElementById("accountBox");
  accountBox.style.display = 'block';
  document.getElementById("acctName").textContent = `Name: ${user.name}`;
  document.getElementById("acctEmail").textContent = `Email: ${user.email}`;
}

function showError(elementId, message) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = message;
  }
}

function clearErrors() {
  showError('loginError', '');
  showError('signupError', '');
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const logoutBtn = document.getElementById('logoutBtn');

  const currentUser = getCurrentUser();
  if (currentUser) {
    showAccount(currentUser);
  }

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      showError('loginError', 'Invalid email or password.');
      return;
    }

    setCurrentUser(user);
    window.location.href = '../index.html';
  });

  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    clearErrors();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim().toLowerCase();
    const password = document.getElementById('signupPassword').value;
    const users = getUsers();

    if (users.some(u => u.email === email)) {
      showError('signupError', 'An account with this email already exists.');
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    saveUsers(users);
    setCurrentUser(newUser);
    window.location.href = '../index.html';
});