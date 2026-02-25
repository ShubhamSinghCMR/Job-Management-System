// Phase 3: role-based dashboard UI for Admin, Employer, Jobseeker.

let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    initDashboard();
});

async function initDashboard() {
    const token = window.localStorage?.getItem("access_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        currentUser = await apiRequest("/users/me", "GET", null, true);
        setupSidebar(currentUser.role);
        loadHomeForRole(currentUser.role);
    } catch {
        window.localStorage?.removeItem("access_token");
        window.location.href = "login.html";
    }
}

function setupSidebar(role) {
    const menu = document.querySelector("#sidebar .sidebar-menu");
    if (!menu) return;

    let items = "";

    if (role === "admin") {
        items = `
            <li class="nav-item">
                <a class="nav-link active" href="#" data-section="admin-dashboard">
                    <span class="sidebar-icon"><i class="bi bi-speedometer2"></i></span>
                    <span class="sidebar-label">Dashboard</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="admin-users">
                    <span class="sidebar-icon"><i class="bi bi-people"></i></span>
                    <span class="sidebar-label">Users</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="admin-jobs">
                    <span class="sidebar-icon"><i class="bi bi-briefcase"></i></span>
                    <span class="sidebar-label">Jobs</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="admin-applications">
                    <span class="sidebar-icon"><i class="bi bi-files"></i></span>
                    <span class="sidebar-label">Applications</span>
                </a>
            </li>
        `;
    } else if (role === "employer") {
        items = `
            <li class="nav-item">
                <a class="nav-link active" href="#" data-section="employer-dashboard">
                    <span class="sidebar-icon"><i class="bi bi-speedometer2"></i></span>
                    <span class="sidebar-label">Dashboard</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="employer-post-job">
                    <span class="sidebar-icon"><i class="bi bi-plus-circle"></i></span>
                    <span class="sidebar-label">Post Job</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="employer-my-jobs">
                    <span class="sidebar-icon"><i class="bi bi-briefcase"></i></span>
                    <span class="sidebar-label">My Jobs</span>
                </a>
            </li>
        `;
    } else if (role === "jobseeker") {
        items = `
            <li class="nav-item">
                <a class="nav-link active" href="#" data-section="jobseeker-dashboard">
                    <span class="sidebar-icon"><i class="bi bi-speedometer2"></i></span>
                    <span class="sidebar-label">Dashboard</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="jobseeker-browse-jobs">
                    <span class="sidebar-icon"><i class="bi bi-search"></i></span>
                    <span class="sidebar-label">Browse Jobs</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="jobseeker-applications">
                    <span class="sidebar-icon"><i class="bi bi-files"></i></span>
                    <span class="sidebar-label">My Applications</span>
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="#" data-section="profile">
                    <span class="sidebar-icon"><i class="bi bi-person"></i></span>
                    <span class="sidebar-label">Profile</span>
                </a>
            </li>
        `;
    }

    menu.innerHTML = items;

    menu.addEventListener("click", (e) => {
        const link = e.target.closest("a[data-section]");
        if (!link) return;
        e.preventDefault();

        menu.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
        link.classList.add("active");

        const section = link.getAttribute("data-section");
        handleSectionClick(section);
    });
}

function loadHomeForRole(role) {
    if (role === "admin") {
        loadAdminDashboard();
    } else if (role === "employer") {
        loadEmployerDashboard();
    } else if (role === "jobseeker") {
        loadJobseekerDashboard();
    }
}

function handleSectionClick(section) {
    if (section === "admin-dashboard") loadAdminDashboard();
    if (section === "admin-users") loadAdminUsers();
    if (section === "admin-jobs") loadAdminJobs();
    if (section === "admin-applications") loadAdminApplications();

    if (section === "employer-dashboard") loadEmployerDashboard();
    if (section === "employer-post-job") loadEmployerPostJobForm();
    if (section === "employer-my-jobs") loadEmployerJobs();

    if (section === "jobseeker-dashboard") loadJobseekerDashboard();
    if (section === "jobseeker-browse-jobs") loadJobseekerBrowseJobs();
    if (section === "jobseeker-applications") loadJobseekerApplications();

    if (section === "profile") loadProfileSettings();
}

/* ========= Admin Views ========= */

async function loadAdminDashboard() {
    const container = getMainContainer();
    if (!container) return;

    let stats;
    try {
        stats = await apiRequest("/admin/stats/overview", "GET", null, true);
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load stats: ${err.message}</div>`;
        return;
    }

    container.innerHTML = `
        <h2 class="mb-4 text-white">Admin Dashboard</h2>
        <div class="row g-4 mb-4">
            ${statCard("Total Users", stats.total_users)}
            ${statCard("Employers", stats.total_employers)}
            ${statCard("Jobseekers", stats.total_jobseekers)}
            ${statCard("Jobs", stats.total_jobs)}
            ${statCard("Applications", stats.total_applications)}
        </div>

        <div class="card bg-dark border-secondary">
            <div class="card-body">
                <div class="d-flex flex-wrap align-items-center justify-content-between mb-3">
                    <h5 class="card-title text-white mb-0">Activity by Period</h5>
                    <div class="mt-2 mt-sm-0">
                        <label class="form-label text-white me-2 mb-0">Period</label>
                        <select id="statsPeriodSelect"
                                class="form-select form-select-sm d-inline-block w-auto bg-black text-white border-secondary">
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly" selected>Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
                <div class="row g-3" id="periodStats">
                    <div class="col-lg-6">
                        <h6 class="text-muted">Jobs</h6>
                        <div id="jobsPeriodTable" class="small text-muted">Loading...</div>
                    </div>
                    <div class="col-lg-6">
                        <h6 class="text-muted">Users</h6>
                        <div id="usersPeriodTable" class="small text-muted">Loading...</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const select = document.getElementById("statsPeriodSelect");
    if (select) {
        select.addEventListener("change", () => {
            updateAdminPeriodStats(select.value);
        });
        // initial load
        updateAdminPeriodStats(select.value);
    }
}

function statCard(title, value) {
    return `
        <div class="col-sm-6 col-md-4 col-lg-3">
            <div class="card bg-dark border-secondary h-100">
                <div class="card-body text-center">
                    <h6 class="text-muted mb-1">${title}</h6>
                    <h3 class="text-white mb-0">${value}</h3>
                </div>
            </div>
        </div>
    `;
}

async function loadAdminUsers() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading users...</p>`;

    try {
        const users = await apiRequest("/admin/users", "GET", null, true);

        const rows = users
            .map(
                (u) => `
            <tr>
                <td>${u.id}</td>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td>${u.role}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-2"
                            onclick="adminToggleUser(${u.id})">
                        Toggle Active
                    </button>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="adminDeleteUser(${u.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">Users</h2>
            <div class="table-responsive">
                <table class="table table-dark table-bordered table-sm align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th style="width: 180px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load users: ${err.message}</div>`;
    }
}

async function loadAdminJobs() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading jobs...</p>`;

    try {
        const jobs = await apiRequest("/admin/jobs", "GET", null, true);

        const rows = jobs
            .map(
                (j) => `
            <tr>
                <td>${j.id}</td>
                <td>${j.title}</td>
                <td>${j.location}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger"
                            onclick="adminDeleteJob(${j.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">Jobs</h2>
            <div class="table-responsive">
                <table class="table table-dark table-bordered table-sm align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Location</th>
                            <th style="width: 120px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load jobs: ${err.message}</div>`;
    }
}

async function loadAdminApplications() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading applications...</p>`;

    try {
        const apps = await apiRequest("/admin/applications", "GET", null, true);

        const rows = apps
            .map(
                (a) => `
            <tr>
                <td>${a.id}</td>
                <td>${a.job_id}</td>
                <td>${a.jobseeker_id}</td>
                <td>${new Date(a.applied_at).toLocaleString()}</td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">Applications</h2>
            <div class="table-responsive">
                <table class="table table-dark table-bordered table-sm align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Job</th>
                            <th>Jobseeker</th>
                            <th>Applied At</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load applications: ${err.message}</div>`;
    }
}

/* ========= Employer Views ========= */

function loadEmployerDashboard() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `
        <h2 class="mb-3 text-white">Employer Dashboard</h2>
        <p class="text-muted">
            Use the sidebar to post new jobs and manage your listings.
        </p>
    `;
}

function loadEmployerPostJobForm() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `
        <h2 class="mb-3 text-white">Post a Job</h2>
        <form id="postJobForm" class="mt-3" novalidate>
            <div class="mb-3">
                <label class="form-label text-white">Title</label>
                <input id="jobTitle" class="form-control bg-black text-white border-secondary" required />
            </div>
            <div class="mb-3">
                <label class="form-label text-white">Location</label>
                <input id="jobLocation" class="form-control bg-black text-white border-secondary" required />
            </div>
            <div class="mb-3">
                <label class="form-label text-white">Description</label>
                <textarea id="jobDescription" rows="3"
                    class="form-control bg-black text-white border-secondary" required></textarea>
            </div>
            <button class="btn btn-light">Create Job</button>
        </form>
        <div id="postJobMessage" class="mt-3 text-muted small"></div>
    `;

    const form = document.getElementById("postJobForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const messageBox = document.getElementById("postJobMessage");
        messageBox.textContent = "";

        const body = {
            title: document.getElementById("jobTitle").value.trim(),
            location: document.getElementById("jobLocation").value.trim(),
            description: document.getElementById("jobDescription").value.trim(),
        };

        if (!body.title || !body.location || !body.description) {
            messageBox.textContent = "All fields are required.";
            return;
        }

        try {
            await apiRequest("/jobs", "POST", body, true);
            messageBox.textContent = "Job created successfully.";
            form.reset();
        } catch (err) {
            messageBox.textContent = `Failed to create job: ${err.message}`;
        }
    });
}

async function loadEmployerJobs() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading your jobs...</p>`;

    try {
        const jobs = await apiRequest("/jobs/my", "GET", null, true);

        if (!jobs.length) {
            container.innerHTML = `
                <h2 class="mb-3 text-white">My Jobs</h2>
                <p class="text-muted">You haven't posted any jobs yet.</p>
            `;
            return;
        }

        const rows = jobs
            .map(
                (j) => `
            <tr>
                <td>${j.id}</td>
                <td>${j.title}</td>
                <td>${j.location}</td>
                <td>
                    <button class="btn btn-sm btn-outline-light me-2"
                            onclick="loadEmployerJobApplications(${j.id})">
                        Applications
                    </button>
                </td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">My Jobs</h2>
            <div class="table-responsive">
                <table class="table table-dark table-bordered table-sm align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Location</th>
                            <th style="width: 140px;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load jobs: ${err.message}</div>`;
    }
}

/* ========= Jobseeker Views ========= */

function loadJobseekerDashboard() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `
        <h2 class="mb-3 text-white">Jobseeker Dashboard</h2>
        <p class="text-muted">
            Use the sidebar to browse jobs and review your applications.
        </p>
    `;
}

async function loadJobseekerBrowseJobs() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading jobs...</p>`;

    try {
        const jobs = await apiRequest("/jobs", "GET", null, true);

        if (!jobs.length) {
            container.innerHTML = `
                <h2 class="mb-3 text-white">Browse Jobs</h2>
                <p class="text-muted">No jobs available at the moment.</p>
            `;
            return;
        }

        const cards = jobs
            .map(
                (j) => `
            <div class="col-md-4 mb-3">
                <div class="card bg-dark border-secondary h-100">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-white">${j.title}</h5>
                        <p class="text-muted small mb-2">${j.location}</p>
                        <p class="text-muted flex-grow-1">
                            ${j.description.substring(0, 120)}...
                        </p>
                        <button class="btn btn-light btn-sm mt-2" onclick="applyToJob(${j.id})">
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">Browse Jobs</h2>
            <div class="row">${cards}</div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load jobs: ${err.message}</div>`;
    }
}

async function applyToJob(jobId) {
    try {
        // Backend expects /applications/{job_id}
        await apiRequest(`/applications/${jobId}`, "POST", null, true);
        alert("Application submitted successfully");
    } catch (err) {
        alert(`Failed to apply: ${err.message}`);
    }
}

async function loadJobseekerApplications() {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading applications...</p>`;

    try {
        const apps = await apiRequest("/applications/my", "GET", null, true);

        if (!apps.length) {
            container.innerHTML = `
                <h2 class="mb-3 text-white">My Applications</h2>
                <p class="text-muted">You haven't applied to any jobs yet.</p>
            `;
            return;
        }

        const rows = apps
            .map(
                (a) => `
            <tr>
                <td>${a.id}</td>
                <td>${a.job_id}</td>
                <td>${new Date(a.applied_at).toLocaleString()}</td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">My Applications</h2>
            <div class="table-responsive">
                <table class="table table-dark table-bordered table-sm align-middle">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Job</th>
                            <th>Applied At</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load applications: ${err.message}</div>`;
    }
}

/* ========= Helpers ========= */

function getMainContainer() {
    return document.querySelector("#pageContent .container-fluid");
}

/* ========= Additional Admin Helpers ========= */

async function updateAdminPeriodStats(period) {
    const jobsContainer = document.getElementById("jobsPeriodTable");
    const usersContainer = document.getElementById("usersPeriodTable");
    if (!jobsContainer || !usersContainer) return;

    jobsContainer.textContent = "Loading...";
    usersContainer.textContent = "Loading...";

    try {
        const [jobsStats, usersStats] = await Promise.all([
            apiRequest(`/admin/stats/jobs?period=${period}`, "GET", null, true),
            apiRequest(`/admin/stats/users?period=${period}`, "GET", null, true),
        ]);

        const jobsRows = (jobsStats.data || [])
            .map(
                (row) => `
            <tr>
                <td>${row.period}</td>
                <td class="text-end">${row.count}</td>
            </tr>
        `
            )
            .join("");

        const usersRows = (usersStats.data || [])
            .map(
                (row) => `
            <tr>
                <td>${row.period}</td>
                <td class="text-end">${row.count}</td>
            </tr>
        `
            )
            .join("");

        jobsContainer.innerHTML = jobsRows
            ? `
                <div class="table-responsive">
                    <table class="table table-dark table-bordered table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th class="text-end">Jobs</th>
                            </tr>
                        </thead>
                        <tbody>${jobsRows}</tbody>
                    </table>
                </div>
            `
            : `<p class="text-muted mb-0">No data for this period.</p>`;

        usersContainer.innerHTML = usersRows
            ? `
                <div class="table-responsive">
                    <table class="table table-dark table-bordered table-sm align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Period</th>
                                <th class="text-end">Users</th>
                            </tr>
                        </thead>
                        <tbody>${usersRows}</tbody>
                    </table>
                </div>
            `
            : `<p class="text-muted mb-0">No data for this period.</p>`;
    } catch (err) {
        jobsContainer.innerHTML = `<span class="text-danger">Failed to load stats: ${err.message}</span>`;
        usersContainer.innerHTML = `<span class="text-danger">Failed to load stats: ${err.message}</span>`;
    }
}

async function adminToggleUser(userId) {
    if (!confirm("Toggle active status for this user?")) return;
    try {
        await apiRequest(`/admin/users/${userId}/toggle`, "PATCH", null, true);
        await loadAdminUsers();
    } catch (err) {
        alert(`Failed to toggle user: ${err.message}`);
    }
}

async function adminDeleteUser(userId) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
        await apiRequest(`/admin/users/${userId}`, "DELETE", null, true);
        await loadAdminUsers();
    } catch (err) {
        alert(`Failed to delete user: ${err.message}`);
    }
}

async function adminDeleteJob(jobId) {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    try {
        await apiRequest(`/admin/jobs/${jobId}`, "DELETE", null, true);
        await loadAdminJobs();
    } catch (err) {
        alert(`Failed to delete job: ${err.message}`);
    }
}

/* ========= Additional Employer Helpers ========= */

async function loadEmployerJobApplications(jobId) {
    const container = getMainContainer();
    if (!container) return;

    container.innerHTML = `<p class="text-muted">Loading applications...</p>`;

    try {
        const apps = await apiRequest(`/applications/job/${jobId}`, "GET", null, true);

        const rows = (apps || [])
            .map(
                (a) => `
            <tr>
                <td>${a.id}</td>
                <td>${a.jobseeker_id}</td>
                <td>${new Date(a.applied_at).toLocaleString()}</td>
            </tr>
        `
            )
            .join("");

        container.innerHTML = `
            <h2 class="mb-3 text-white">Applications for Job #${jobId}</h2>
            <button class="btn btn-sm btn-outline-light mb-3" onclick="loadEmployerJobs()">
                &larr; Back to My Jobs
            </button>
            ${
                rows
                    ? `
                <div class="table-responsive">
                    <table class="table table-dark table-bordered table-sm align-middle">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Jobseeker</th>
                                <th>Applied At</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            `
                    : `<p class="text-muted">No applications yet for this job.</p>`
            }
        `;
    } catch (err) {
        container.innerHTML = `<div class="alert alert-danger">Failed to load applications: ${err.message}</div>`;
    }
}

/* ========= Profile / Settings ========= */

function loadProfileSettings() {
    const container = getMainContainer();
    if (!container || !currentUser) return;

    container.innerHTML = `
        <h2 class="mb-3 text-white">Profile Settings</h2>
        <form id="profileForm" class="mt-3" novalidate>
            <div class="mb-3">
                <label class="form-label text-white">Name</label>
                <input id="profileName"
                       class="form-control bg-black text-white border-secondary"
                       value="${currentUser.name || ""}" />
            </div>
            <div class="mb-3">
                <label class="form-label text-white">Email</label>
                <input id="profileEmail"
                       class="form-control bg-black text-white border-secondary"
                       value="${currentUser.email || ""}"
                       readonly />
                <div class="form-text text-muted">
                    Email cannot be changed in this demo.
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label text-white">New Password</label>
                <input id="profilePassword"
                       type="password"
                       class="form-control bg-black text-white border-secondary"
                       placeholder="Leave blank to keep current password" />
            </div>
            <button class="btn btn-light">Save Changes</button>
        </form>
        <div id="profileMessage" class="mt-3 text-muted small"></div>
    `;

    const form = document.getElementById("profileForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const msg = document.getElementById("profileMessage");
        msg.textContent = "";

        const name = document.getElementById("profileName").value.trim();
        const password = document.getElementById("profilePassword").value;

        const body = {};
        if (name && name !== currentUser.name) {
            body.name = name;
        }
        if (password) {
            body.password = password;
        }

        if (!body.name && !body.password) {
            msg.textContent = "Nothing to update.";
            return;
        }

        try {
            const updated = await apiRequest("/users/me", "PUT", body, true);
            currentUser = updated || currentUser;
            msg.textContent = "Profile updated successfully.";
        } catch (err) {
            msg.textContent = `Failed to update profile: ${err.message}`;
        }
    });
}


