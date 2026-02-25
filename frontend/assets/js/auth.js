// Handles login and registration flows against the FastAPI backend.

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    if (loginForm) {
        loginForm.addEventListener("submit", onLoginSubmit);
    }

    if (registerForm) {
        registerForm.addEventListener("submit", onRegisterSubmit);
    }
});

async function onLoginSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorBox = document.getElementById("loginError");

    hideError(errorBox);

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showError(errorBox, "Please enter email and password.");
        return;
    }

    try {
        // FastAPI OAuth2PasswordRequestForm expects form-encoded "username" and "password"
        const formData = new URLSearchParams();
        formData.append("username", email);
        formData.append("password", password);

        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            throw new Error("Invalid credentials");
        }

        const data = await response.json();
        window.localStorage.setItem("access_token", data.access_token);

        // Go to dashboard after successful login
        window.location.href = "dashboard.html";
    } catch (err) {
        showError(errorBox, err.message || "Login failed");
    }
}

async function onRegisterSubmit(event) {
    event.preventDefault();

    const nameInput = document.getElementById("name");
    const emailInput = document.getElementById("regEmail");
    const passwordInput = document.getElementById("regPassword");
    const roleSelect = document.getElementById("role");
    const errorBox = document.getElementById("registerError");

    hideError(errorBox);

    const body = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
        role: roleSelect.value,
    };

    if (!body.name || !body.email || !body.password || !body.role) {
        showError(errorBox, "All fields are required.");
        return;
    }

    try {
        await apiRequest("/auth/register", "POST", body, false);
        // On successful registration, send user to login
        window.location.href = "login.html";
    } catch (err) {
        showError(errorBox, err.message || "Registration failed");
    }
}

function showError(box, message) {
    if (!box) return;
    box.textContent = message;
    box.classList.remove("d-none");
}

function hideError(box) {
    if (!box) return;
    box.classList.add("d-none");
    box.textContent = "";
}

