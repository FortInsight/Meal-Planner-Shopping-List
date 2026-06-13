const authApi = window.MealPlannerAuth;

const authMessage = document.getElementById("auth-message");
const updatePasswordMessage = document.getElementById("update-password-message");
const signupButton = document.getElementById("signup-button");
const loginButton = document.getElementById("login-button");
const forgotPasswordButton = document.getElementById("forgot-password-button");
const updatePasswordForm = document.getElementById("update-password-form");
const backToLoginButton = document.getElementById("back-to-login-button");
const authForm = document.getElementById("auth-form");
const authMenuButton = document.getElementById("auth-menu-button");
const authMenuBackdrop = document.getElementById("auth-menu-backdrop");
const authCopyClose = document.getElementById("auth-copy-close");

function setAuthMessage(text) {
  authMessage.textContent = text;
}

function setUpdatePasswordMessage(text) {
  updatePasswordMessage.textContent = text;
}

function authClientReady() {
  return Boolean(authApi?.authEnabled?.());
}

function setAuthCopyOpen(isOpen) {
  document.body.classList.toggle("auth-copy-open", isOpen);
  document.body.classList.toggle("drawer-open", isOpen);
  authMenuButton?.setAttribute("aria-expanded", String(isOpen));
}

function togglePasswordVisibility(input, button, visibleLabel, hiddenLabel) {
  if (!input || !button) {
    return;
  }

  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";
  button.classList.toggle("is-visible", isHidden);
  button.setAttribute("aria-label", isHidden ? visibleLabel : hiddenLabel);
  button.setAttribute("aria-pressed", String(isHidden));
}

function inRecoveryMode() {
  return window.location.hash.includes("type=recovery");
}

function setRecoveryMode(enabled) {
  document.getElementById("auth-form").hidden = enabled;
  updatePasswordForm.hidden = !enabled;
}

async function openPlannerIfSignedIn() {
  const session = await authApi?.getSessionAsync?.();
  if (session && !inRecoveryMode()) {
    window.location.href = "index.html";
    return;
  }

  setRecoveryMode(inRecoveryMode());
  document.body.classList.remove("auth-pending");
}

async function signUpUser() {
  const userName = document.getElementById("auth-name").value.trim();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  setAuthMessage("");

  if (!authClientReady()) {
    setAuthMessage("Paste your Supabase URL and publishable key into supabase-config.js first.");
    return;
  }

  const { error, session } = await authApi.createUser({
    userName,
    email,
    password,
    emailRedirectTo: authApi.getPlannerUrl()
  });

  if (error) {
    setAuthMessage(error);
    return;
  }

  if (session) {
    window.location.href = "index.html";
    return;
  }

  setAuthMessage("Account created. Check your email to confirm, then log in.");
}

async function loginUser() {
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;

  setAuthMessage("");

  if (!authClientReady()) {
    setAuthMessage("Paste your Supabase URL and publishable key into supabase-config.js first.");
    return;
  }

  const { error } = await authApi.loginUser({ email, password });
  if (error) {
    setAuthMessage(`Login error: ${error}`);
    return;
  }

  setAuthMessage("Login successful. Opening planner...");
  window.location.href = "index.html";
}

async function sendPasswordReset() {
  const email = document.getElementById("auth-email").value.trim();

  setAuthMessage("");

  if (!authClientReady()) {
    setAuthMessage("Paste your Supabase URL and publishable key into supabase-config.js first.");
    return;
  }

  const { error } = await authApi.sendPasswordReset({
    email,
    redirectTo: authApi.getLoginUrl()
  });

  if (error) {
    setAuthMessage(`Reset error: ${error}`);
    return;
  }

  setAuthMessage("Password reset email sent. Open the email and return here to update your password.");
}

async function updatePassword(event) {
  event.preventDefault();

  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  setUpdatePasswordMessage("");

  if (!authClientReady()) {
    setUpdatePasswordMessage("Paste your Supabase URL and publishable key into supabase-config.js first.");
    return;
  }

  if (!newPassword || !confirmPassword) {
    setUpdatePasswordMessage("Enter and confirm your new password.");
    return;
  }

  if (newPassword !== confirmPassword) {
    setUpdatePasswordMessage("The passwords do not match.");
    return;
  }

  const { error } = await authApi.updatePassword({ password: newPassword });
  if (error) {
    setUpdatePasswordMessage(`Update error: ${error}`);
    return;
  }

  setUpdatePasswordMessage("Password updated successfully. Opening planner...");
  window.location.hash = "";
  window.location.href = "index.html";
}

async function submitAuthForm(event) {
  event.preventDefault();
  await loginUser();
}

signupButton.addEventListener("click", signUpUser);
loginButton.addEventListener("click", loginUser);
forgotPasswordButton.addEventListener("click", sendPasswordReset);
updatePasswordForm.addEventListener("submit", updatePassword);
authForm.addEventListener("submit", submitAuthForm);
backToLoginButton?.addEventListener("click", () => {
  window.location.hash = "";
  setRecoveryMode(false);
});

document.getElementById("toggle-password-button")?.addEventListener("click", () => {
  togglePasswordVisibility(
    document.getElementById("auth-password"),
    document.getElementById("toggle-password-button"),
    "Hide password",
    "Show password"
  );
});

document.getElementById("toggle-new-password-button")?.addEventListener("click", () => {
  togglePasswordVisibility(
    document.getElementById("new-password"),
    document.getElementById("toggle-new-password-button"),
    "Hide new password",
    "Show new password"
  );
});

document.getElementById("toggle-confirm-password-button")?.addEventListener("click", () => {
  togglePasswordVisibility(
    document.getElementById("confirm-password"),
    document.getElementById("toggle-confirm-password-button"),
    "Hide confirmed password",
    "Show confirmed password"
  );
});

authMenuButton?.addEventListener("click", () => setAuthCopyOpen(true));
authMenuBackdrop?.addEventListener("click", () => setAuthCopyOpen(false));
authCopyClose?.addEventListener("click", () => setAuthCopyOpen(false));

authApi?.supabaseClient?.auth?.onAuthStateChange?.((event, session) => {
  if (event === "PASSWORD_RECOVERY") {
    setRecoveryMode(true);
    document.body.classList.remove("auth-pending");
    return;
  }

  if ((event === "INITIAL_SESSION" || event === "SIGNED_IN") && session && !inRecoveryMode()) {
    window.location.href = "index.html";
  }
});

openPlannerIfSignedIn();
