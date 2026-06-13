(function () {
  const AUTH_STORAGE_KEY = "meal-planner-auth-v1";

  function loadAuthStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY));
      return {
        users: raw?.users && typeof raw.users === "object" ? raw.users : {},
        currentUserId: raw?.currentUserId || ""
      };
    } catch {
      return { users: {}, currentUserId: "" };
    }
  }

  function saveAuthStore(store) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(store));
  }

  function buildUserId(userName) {
    return String(userName || "").trim().toLowerCase();
  }

  function hashCode(value) {
    let hash = 0;
    const text = String(value);
    for (let index = 0; index < text.length; index += 1) {
      hash = ((hash << 5) - hash + text.charCodeAt(index)) | 0;
    }
    return hash;
  }

  function hashPassword(password) {
    return String(hashCode(`meal-planner-profile:${password}`));
  }

  function getCurrentUser() {
    const store = loadAuthStore();
    if (!store.currentUserId) {
      return null;
    }

    const profile = store.users[store.currentUserId];
    if (!profile) {
      return null;
    }

    return {
      id: profile.id,
      email: "",
      user_metadata: {
        user_name: profile.name
      }
    };
  }

  function getSession() {
    const user = getCurrentUser();
    return user ? { user } : null;
  }

  function getDisplayName(user) {
    return user?.user_metadata?.user_name || "Planner";
  }

  function setAuthedUi(user) {
    const nameEl = document.getElementById("auth-welcome-name");
    const emailEl = document.getElementById("auth-user-email");
    const statusEl = document.getElementById("auth-status-label");

    if (statusEl) {
      statusEl.textContent = "Welcome";
    }
    if (nameEl) {
      nameEl.textContent = getDisplayName(user);
    }
    if (emailEl) {
      emailEl.textContent = "Saved on this device";
    }
  }

  function logout() {
    const store = loadAuthStore();
    store.currentUserId = "";
    saveAuthStore(store);
    window.location.href = "login.html";
  }

  function ensureAuthenticated() {
    const pageNeedsAuth = document.body?.dataset.requiresAuth === "true";
    if (!pageNeedsAuth) {
      document.body?.classList.remove("auth-pending");
      return null;
    }

    const session = getSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }

    setAuthedUi(session.user);
    const logoutButton = document.getElementById("logout-button");
    const drawerLogoutButton = document.getElementById("drawer-logout-button");
    if (logoutButton) {
      logoutButton.addEventListener("click", logout);
    }
    if (drawerLogoutButton) {
      drawerLogoutButton.addEventListener("click", logout);
    }

    document.body?.classList.remove("auth-pending");
    return session;
  }

  async function registerPwa() {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isSupportedOrigin =
      window.location.protocol === "https:"
      || ["localhost", "127.0.0.1"].includes(window.location.hostname);

    if (!isSupportedOrigin) {
      return;
    }

    try {
      await navigator.serviceWorker.register("sw.js");
    } catch {
      // Ignore registration issues in local or unsupported environments.
    }
  }

  function createUser({ userName, password }) {
    const store = loadAuthStore();
    const id = buildUserId(userName);
    if (!id) {
      return { error: "Enter a user name." };
    }
    if (!password) {
      return { error: "Enter a password." };
    }
    if (store.users[id]) {
      return { error: "That user name already exists. Log in or choose another name." };
    }

    store.users[id] = {
      id,
      name: userName.trim(),
      passwordHash: hashPassword(password)
    };
    store.currentUserId = id;
    saveAuthStore(store);
    return { user: getCurrentUser() };
  }

  function loginUser({ userName, password }) {
    const store = loadAuthStore();
    const id = buildUserId(userName);
    const user = store.users[id];
    if (!user || user.passwordHash !== hashPassword(password)) {
      return { error: "The user name or password does not match." };
    }

    store.currentUserId = id;
    saveAuthStore(store);
    return { user: getCurrentUser() };
  }

  window.MealPlannerAuth = {
    AUTH_STORAGE_KEY,
    createUser,
    ensureAuthenticated,
    getCurrentUser,
    getCurrentUserId: () => getCurrentUser()?.id || "",
    getDisplayName,
    getLoginUrl: () => new URL("login.html", window.location.href).href,
    getSession,
    getUser: async () => getCurrentUser(),
    hashPassword,
    loginUser,
    logout
  };

  window.addEventListener("load", () => {
    void registerPwa();
  });
})();
