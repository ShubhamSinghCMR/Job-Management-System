// Public landing page: fetch and display jobs with simple filters.

let landingJobs = [];

document.addEventListener("DOMContentLoaded", () => {
    loadLandingJobs();
});

async function loadLandingJobs() {
    const container = document.getElementById("homeCards");
    if (!container) return;

    // Append filter controls above the cards
    const pageContent = document.getElementById("pageContent");
    if (pageContent && !document.getElementById("landingFilters")) {
        const filterRow = document.createElement("div");
        filterRow.id = "landingFilters";
        filterRow.className = "row g-3 align-items-end mb-4";
        filterRow.innerHTML = `
            <div class="col-md-5">
                <label class="form-label text-white">Filter by Title</label>
                <select id="landingTitleFilter"
                        class="form-select bg-black text-white border-secondary">
                    <option value="">All titles</option>
                </select>
            </div>
            <div class="col-md-5">
                <label class="form-label text-white">Filter by Location</label>
                <select id="landingLocationFilter"
                        class="form-select bg-black text-white border-secondary">
                    <option value="">All locations</option>
                </select>
            </div>
            <div class="col-md-2 d-grid">
                <button class="btn btn-light mt-3" id="landingResetBtn">Reset</button>
            </div>
        `;
        pageContent.insertBefore(filterRow, container);
    }

    try {
        const jobs = await apiRequest("/jobs", "GET", null, false);
        landingJobs = jobs || [];
        populateLandingFilters(landingJobs);
        renderLandingJobs(landingJobs);
    } catch (err) {
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger">
                    Failed to load jobs from server: ${err.message}
                </div>
            </div>
        `;
    }

    const titleFilter = document.getElementById("landingTitleFilter");
    const locationFilter = document.getElementById("landingLocationFilter");
    const resetBtn = document.getElementById("landingResetBtn");

    if (titleFilter) {
        titleFilter.addEventListener("change", filterLandingJobs);
    }
    if (locationFilter) {
        locationFilter.addEventListener("change", filterLandingJobs);
    }
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (titleFilter) titleFilter.value = "";
            if (locationFilter) locationFilter.value = "";
            renderLandingJobs(landingJobs);
        });
    }
}

function populateLandingFilters(jobs) {
    const titleFilter = document.getElementById("landingTitleFilter");
    const locationFilter = document.getElementById("landingLocationFilter");
    if (!titleFilter || !locationFilter) return;

    const titles = [...new Set(jobs.map((j) => (j.title || "").trim()))].filter(Boolean);
    const locations = [...new Set(jobs.map((j) => (j.location || "").trim()))].filter(Boolean);

    titleFilter.innerHTML = `<option value="">All titles</option>`;
    titles.forEach((t) => {
        const opt = document.createElement("option");
        opt.value = t.toLowerCase();
        opt.textContent = t;
        titleFilter.appendChild(opt);
    });

    locationFilter.innerHTML = `<option value="">All locations</option>`;
    locations.forEach((loc) => {
        const opt = document.createElement("option");
        opt.value = loc.toLowerCase();
        opt.textContent = loc;
        locationFilter.appendChild(opt);
    });
}

function filterLandingJobs() {
    const titleFilter = document.getElementById("landingTitleFilter");
    const locationFilter = document.getElementById("landingLocationFilter");
    if (!titleFilter || !locationFilter) return;

    const titleVal = titleFilter.value;
    const locationVal = locationFilter.value;

    const filtered = landingJobs.filter((job) => {
        const jt = (job.title || "").toLowerCase().trim();
        const jl = (job.location || "").toLowerCase().trim();
        const titleMatch = !titleVal || jt === titleVal;
        const locationMatch = !locationVal || jl === locationVal;
        return titleMatch && locationMatch;
    });

    renderLandingJobs(filtered);
}

function renderLandingJobs(jobs) {
    const container = document.getElementById("homeCards");
    if (!container) return;

    if (!jobs.length) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted mb-0">No jobs found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = jobs
        .map(
            (job) => `
        <div class="col-md-4 mb-3">
            <div class="card h-100 bg-dark border-secondary text-white">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${job.title}</h5>
                    <p class="text-muted small mb-2">${job.location}</p>
                    <p class="text-muted flex-grow-1">
                        ${(job.description || "").substring(0, 120)}...
                    </p>
                    <button class="btn btn-light btn-sm mt-2" onclick="landingApply(${job.id})">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    `
        )
        .join("");
}

function landingApply(jobId) {
    const token = window.localStorage?.getItem("access_token");
    if (!token) {
        // Not logged in: send to login, then they can go to dashboard.
        window.location.href = "login.html";
        return;
    }
    // Logged in: direct them to dashboard where they have full role-based UI.
    window.location.href = "dashboard.html";
}

