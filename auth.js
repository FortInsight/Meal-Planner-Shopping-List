(function () {
  const SUPABASE_URL = window.SUPABASE_URL || "";
  const SUPABASE_KEY = window.SUPABASE_KEY || "";
  const supabaseClient =
    SUPABASE_URL && SUPABASE_KEY && window.supabase?.createClient
      ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        })
      : null;

  let currentSession = null;

  function authEnabled() {
    return Boolean(supabaseClient);
  }

  function getDisplayName(user) {
    return user?.user_metadata?.user_name || user?.email || "Planner";
  }

  function getCurrentUser() {
    return currentSession?.user || null;
  }

  function getSession() {
    return currentSession;
  }

  function getCurrentUserId() {
    return getCurrentUser()?.id || "";
  }

  async function refreshSession() {
    if (!authEnabled()) {
      currentSession = null;
      return null;
    }

    const { data, error } = await supabaseClient.auth.getSession();
    if (error) {
      currentSession = null;
      return null;
    }

    currentSession = data.session || null;
    return currentSession;
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
      emailEl.textContent = user?.email || "";
    }
  }

  async function logout() {
    if (authEnabled()) {
      await supabaseClient.auth.signOut();
    }
    currentSession = null;
    window.location.href = "login.html";
  }

  async function ensureAuthenticated() {
    const pageNeedsAuth = document.body?.dataset.requiresAuth === "true";

    if (!authEnabled()) {
      document.body?.classList.remove("auth-pending");
      return null;
    }

    const session = await refreshSession();

    if (!pageNeedsAuth) {
      document.body?.classList.remove("auth-pending");
      return session;
    }

    if (!session) {
      window.location.href = "login.html";
      return null;
    }

    setAuthedUi(session.user);

    const logoutButton = document.getElementById("logout-button");
    const drawerLogoutButton = document.getElementById("drawer-logout-button");
    if (logoutButton && !logoutButton.dataset.boundLogout) {
      logoutButton.dataset.boundLogout = "true";
      logoutButton.addEventListener("click", logout);
    }
    if (drawerLogoutButton && !drawerLogoutButton.dataset.boundLogout) {
      drawerLogoutButton.dataset.boundLogout = "true";
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

  async function createUser({ userName, email, password, emailRedirectTo }) {
    if (!authEnabled()) {
      return { error: "Paste your Supabase URL and publishable key into supabase-config.js first." };
    }
    if (!email || !password) {
      return { error: "Please enter email and password." };
    }

    const { data, error } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: userName || ""
        },
        emailRedirectTo
      }
    });

    if (error) {
      return { error: error.message };
    }

    currentSession = data.session || null;
    return { user: data.user || currentSession?.user || null, session: currentSession };
  }

  async function loginUser({ email, password }) {
    if (!authEnabled()) {
      return { error: "Paste your Supabase URL and publishable key into supabase-config.js first." };
    }
    if (!email || !password) {
      return { error: "Please enter email and password." };
    }

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      return { error: error.message };
    }

    currentSession = data.session || null;
    return { user: data.user || currentSession?.user || null, session: currentSession };
  }

  async function sendPasswordReset({ email, redirectTo }) {
    if (!authEnabled()) {
      return { error: "Paste your Supabase URL and publishable key into supabase-config.js first." };
    }
    if (!email) {
      return { error: "Enter your email first." };
    }

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo
    });

    return error ? { error: error.message } : { error: "" };
  }

  async function updatePassword({ password }) {
    if (!authEnabled()) {
      return { error: "Paste your Supabase URL and publishable key into supabase-config.js first." };
    }
    if (!password) {
      return { error: "Enter a new password." };
    }

    const { data, error } = await supabaseClient.auth.updateUser({ password });
    if (error) {
      return { error: error.message };
    }

    currentSession = currentSession ? { ...currentSession, user: data.user || currentSession.user } : currentSession;
    return { error: "" };
  }

  if (authEnabled()) {
    supabaseClient.auth.onAuthStateChange((_event, session) => {
      currentSession = session || null;

      if (document.body?.dataset.requiresAuth === "true" && session?.user) {
        setAuthedUi(session.user);
        document.body?.classList.remove("auth-pending");
      }
    });
  }

  window.MealPlannerAuth = {
    authEnabled,
    createUser,
    ensureAuthenticated,
    getCurrentUser,
    getCurrentUserId,
    getDisplayName,
    getLoginUrl: () => new URL("login.html", new URL("./", window.location.href)).href,
    getPlannerUrl: () => new URL("./", window.location.href).href,
    getSession,
    getSessionAsync: refreshSession,
    getUser: async () => getCurrentUser(),
    loginUser,
    logout,
    sendPasswordReset,
    supabaseClient,
    updatePassword
  };

  window.addEventListener("load", () => {
    void registerPwa();
  });
})();
