const authApi = window.MealPlannerAuth;

const authForm = document.getElementById("auth-form");
const authMessage = document.getElementById("auth-message");
const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");
const passwordInput = document.getElementById("auth-password");
const togglePasswordButton = document.getElementById("toggle-password-button");
const authMenuButton = document.getElementById("auth-menu-button");
const authMenuBackdrop = document.getElementById("auth-menu-backdrop");
const authCopyClose = document.getElementById("auth-copy-close");

function setAuthMessage(text) {
  authMessage.textContent = text;
}

function authClientReady() {
  return Boolean(authApi);
}

function setAuthCopyOpen(isOpen) {
  document.body.classList.toggle("auth-copy-open", isOpen);
  document.body.classList.toggle("drawer-open", isOpen);
  authMenuButton?.setAttribute("aria-expanded", String(isOpen));
}

function togglePasswordVisibility() {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePasswordButton.classList.toggle("is-visible", isHidden);
  togglePasswordButton.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  togglePasswordButton.setAttribute("aria-pressed", String(isHidden));
}

async function openPlannerIfSignedIn() {
  const session = authApi?.getSession?.();
  if (session) {
    window.location.href = "index.html";
    return;
  }

  document.body.classList.remove("auth-pending");
}

async function signUpUser() {
  const name = document.getElementById("auth-name").value.trim();
  const password = document.getElementById("auth-password").value;

  setAuthMessage("");

  if (!authClientReady()) {
    setAuthMessage("Auth is not available right now.");
    return;
  }
  if (!name || !password) {
    setAuthMessage("Please enter a user name and password.");
    return;
  }

  const { error } = authApi.createUser({
    userName: name,
    password
  });

  if (error) {
    setAuthMessage(error);
    return;
  }

  window.location.href = "index.html";
}

async function loginUser() {
  const userName = document.getElementById("auth-name").value.trim();
  const password = document.getElementById("auth-password").value;

  setAuthMessage("");

  if (!authClientReady()) {
    setAuthMessage("Auth is not available right now.");
    return;
  }
  if (!userName || !password) {
    setAuthMessage("Please enter your user name and password.");
    return;
  }

  const { error } = authApi.loginUser({ userName, password });
  if (error) {
    setAuthMessage(error);
    return;
  }

  window.location.href = "index.html";
}

signupButton.addEventListener("click", signUpUser);
loginButton.addEventListener("click", loginUser);
togglePasswordButton.addEventListener("click", togglePasswordVisibility);
authMenuButton?.addEventListener("click", () => setAuthCopyOpen(true));
authMenuBackdrop?.addEventListener("click", () => setAuthCopyOpen(false));
authCopyClose?.addEventListener("click", () => setAuthCopyOpen(false));
openPlannerIfSignedIn();
