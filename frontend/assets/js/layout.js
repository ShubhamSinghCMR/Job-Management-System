// Shared layout: header, footer, and basic nav links.

document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
});

function renderHeader() {
    const header = document.getElementById("header");
    if (!header) return;

    header.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-black">
            <div class="container-fluid px-3 px-lg-4">
                <a class="navbar-brand" href="index.html">Job Portal</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarNav" aria-controls="navbarNav"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav ms-auto" id="navLinks">
                        ${buildNavLinks()}
                    </ul>
                </div>
            </div>
        </nav>
    `;
}

function buildNavLinks() {
    const token = window.localStorage?.getItem("access_token");

    if (!token) {
        return `
            <li class="nav-item">
                <a class="nav-link" href="login.html">Login</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="register.html">Register</a>
            </li>
        `;
    }

    return `
        <li class="nav-item">
            <a class="nav-link" href="dashboard.html">Dashboard</a>
        </li>
        <li class="nav-item">
            <a class="nav-link" href="#" onclick="logoutFront()">Logout</a>
        </li>
    `;
}

function renderFooter() {
    const footer = document.getElementById("footer");
    if (!footer) return;

    footer.innerHTML = `
        <footer class="bg-black text-center text-muted py-3 mt-auto">
            <small>&copy; 2026 Job Management System</small>
        </footer>
    `;
}

function logoutFront() {
    try {
        window.localStorage?.removeItem("access_token");
    } catch (_) {
        // ignore
    }
    window.location.href = "login.html";
}

