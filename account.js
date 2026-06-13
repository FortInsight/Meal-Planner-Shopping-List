const accountForm = document.getElementById("account-form");
const accountMessage = document.getElementById("account-message");
const accountNameInput = document.getElementById("account-name");
const accountEmailInput = document.getElementById("account-email");
const accountPasswordInput = document.getElementById("account-password");
const accountPasswordConfirmInput = document.getElementById("account-password-confirm");
const accountSummaryName = document.getElementById("account-summary-name");
const accountSummaryEmail = document.getElementById("account-summary-email");
const accountLogoutButton = document.getElementById("account-logout-button");

function setAccountMessage(text) {
  accountMessage.textContent = text;
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

function fillAccountForm(user) {
  const displayName = window.MealPlannerAuth?.getDisplayName?.(user) || "";
  accountNameInput.value = user?.user_metadata?.user_name || displayName || "";
  accountEmailInput.value = user?.email || "";
  accountSummaryName.textContent = displayName || "Planner";
  accountSummaryEmail.textContent = user?.email || "";
}

async function updateAccount(event) {
  event.preventDefault();
  setAccountMessage("");

  const supabaseClient = window.MealPlannerAuth?.supabaseClient;
  if (!supabaseClient) {
    setAccountMessage("Supabase is not configured.");
    return;
  }

  const userName = accountNameInput.value.trim();
  const email = accountEmailInput.value.trim();
  const password = accountPasswordInput.value;
  const confirmPassword = accountPasswordConfirmInput.value;

  if (!userName || !email) {
    setAccountMessage("User name and email are required.");
    return;
  }

  if (password || confirmPassword) {
    if (password !== confirmPassword) {
      setAccountMessage("Passwords do not match.");
      return;
    }
  }

  const payload = {
    email,
    data: {
      user_name: userName
    }
  };

  if (password) {
    payload.password = password;
  }

  const { data, error } = await supabaseClient.auth.updateUser(payload);
  if (error) {
    setAccountMessage(`Update error: ${error.message}`);
    return;
  }

  fillAccountForm(data.user);
  accountPasswordInput.value = "";
  accountPasswordConfirmInput.value = "";
  setAccountMessage("Account updated. If you changed your email, check your inbox for confirmation.");
}

async function initAccountPage() {
  const session = await window.MealPlannerAuth?.ensureAuthenticated?.();
  if (!session) {
    return;
  }

  fillAccountForm(session.user);
  document.body.classList.remove("auth-pending");
}

accountForm?.addEventListener("submit", updateAccount);
accountLogoutButton?.addEventListener("click", () => {
  void window.MealPlannerAuth?.logout?.();
});

document.getElementById("toggle-account-password-button")?.addEventListener("click", () => {
  togglePasswordVisibility(
    accountPasswordInput,
    document.getElementById("toggle-account-password-button"),
    "Hide new password",
    "Show new password"
  );
});

document.getElementById("toggle-account-password-confirm-button")?.addEventListener("click", () => {
  togglePasswordVisibility(
    accountPasswordConfirmInput,
    document.getElementById("toggle-account-password-confirm-button"),
    "Hide confirmed password",
    "Show confirmed password"
  );
});

void initAccountPage();
