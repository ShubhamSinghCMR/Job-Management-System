/**
 * Role-based dashboard: Admin, Employer, Jobseeker.
 * Sidebar and content are built from current user role.
 */
var currentUser = null;

/* Force sidebar collapsed immediately so it runs before AdminLTE or any other script */
(function forceSidebarCollapsedSync() {
  document.body.classList.add("sidebar-collapse");
  document.body.classList.remove("sidebar-open");
  try {
    if (window.localStorage) localStorage.removeItem("remember.lte.pushmenu");
  } catch (e) {}
})();

document.addEventListener("DOMContentLoaded", function () {
  initDashboard();
});

function initDashboard() {
  var token = window.localStorage && window.localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  apiRequest("/users/me", "GET", null, true)
    .then(function (user) {
      currentUser = user;
      setupSidebar(user.role);
      loadHomeForRole(user.role);
      showPrivacyBannerIfNeeded();
      preventSidebarCollapseOnHover();
      ensureSidebarClosedOnLoad();
    })
    .catch(function () {
      if (window.localStorage) window.localStorage.removeItem("access_token");
      window.location.href = "login.html";
    });
}

function setupSidebar(role) {
  var menu = document.getElementById("sidebarMenu");
  if (!menu) return;

  var brandEl = document.getElementById("sidebarBrandText");
  if (brandEl) {
    if (role === "admin") brandEl.textContent = "Admin Portal";
    else if (role === "employer") brandEl.textContent = "Employer Portal";
    else if (role === "jobseeker") brandEl.textContent = "Jobseeker Portal";
    else brandEl.textContent = "Dashboard";
  }

  var headerPortalEl = document.getElementById("headerPortalName");
  if (headerPortalEl) {
    if (role === "admin") headerPortalEl.textContent = "Admin Portal";
    else if (role === "employer") headerPortalEl.textContent = "Employer Portal";
    else if (role === "jobseeker") headerPortalEl.textContent = "Jobseeker Portal";
    else headerPortalEl.textContent = "Job Portal";
  }

  /* Clicking portal name in header should go to role dashboard (not index) */
  var portalLink = document.getElementById("headerPortalLink");
  if (portalLink) {
    portalLink.addEventListener("click", function (e) {
      e.preventDefault();
      var section = role === "admin" ? "admin-dashboard" : role === "employer" ? "employer-dashboard" : role === "jobseeker" ? "jobseeker-dashboard" : null;
      if (section) {
        var menu = document.getElementById("sidebarMenu");
        if (menu) {
          menu.querySelectorAll(".nav-link").forEach(function (l) {
            l.classList.remove("active");
            if (l.getAttribute("data-section") === section) l.classList.add("active");
          });
        }
        handleSectionClick(section);
      } else {
        window.location.href = "dashboard.html";
      }
    });
  }

  var items = [];
  if (role === "admin") {
    items = [
      { section: "admin-dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
      { section: "admin-users", icon: "fas fa-users", label: "Users" },
      { section: "admin-jobs", icon: "fas fa-briefcase", label: "Jobs" },
      { section: "admin-applications", icon: "fas fa-file-alt", label: "Applications" },
      { section: "profile", icon: "fas fa-user", label: "Profile" },
      { section: "settings", icon: "fas fa-cog", label: "Settings" },
    ];
  } else if (role === "employer") {
    items = [
      { section: "employer-dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
      { section: "employer-post-job", icon: "fas fa-plus-circle", label: "Post Job" },
      { section: "employer-my-jobs", icon: "fas fa-briefcase", label: "My Jobs" },
      { section: "profile", icon: "fas fa-user", label: "Profile" },
      { section: "settings", icon: "fas fa-cog", label: "Settings" },
    ];
  } else if (role === "jobseeker") {
    items = [
      { section: "jobseeker-dashboard", icon: "fas fa-tachometer-alt", label: "Dashboard" },
      { section: "jobseeker-browse-jobs", icon: "fas fa-search", label: "Browse Jobs" },
      { section: "jobseeker-applications", icon: "fas fa-file-alt", label: "My Applications" },
      { section: "profile", icon: "fas fa-user", label: "Profile" },
      { section: "settings", icon: "fas fa-cog", label: "Settings" },
    ];
  }

  menu.innerHTML = items
    .map(function (item, i) {
      var active = i === 0 ? " active" : "";
      return (
        '<li class="nav-item">' +
        '<a href="#" class="nav-link' + active + '" data-section="' + item.section + '">' +
        '<i class="nav-icon ' + item.icon + '"></i>' +
        "<p>" + item.label + "</p>" +
        "</a></li>"
      );
    })
    .join("");

  menu.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-section]");
    if (!link) return;
    e.preventDefault();
    menu.querySelectorAll(".nav-link").forEach(function (l) {
      l.classList.remove("active");
    });
    link.classList.add("active");
    handleSectionClick(link.getAttribute("data-section"));
    /* On mobile, close the sidebar overlay after selecting a menu item */
    if (window.innerWidth < 992) {
      document.body.classList.add("sidebar-collapse");
      document.body.classList.remove("sidebar-open");
    }
  });
}

function loadHomeForRole(role) {
  setPageTitle("Dashboard");
  if (role === "admin") loadAdminDashboard();
  else if (role === "employer") loadEmployerDashboard();
  else if (role === "jobseeker") loadJobseekerDashboard();
}

function handleSectionClick(section) {
  setPageTitle(getPageTitleForSection(section));
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
  if (section === "settings") loadSettings();
}

function getMainContainer() {
  return document.getElementById("pageContent");
}

function setPageTitle(title) {
  var wrap = document.getElementById("pageTitleWrap");
  var el = document.getElementById("pageTitle");
  if (wrap && el) {
    el.textContent = title || "";
    wrap.style.display = title ? "block" : "none";
  }
}

function getPageTitleForSection(section) {
  var titles = {
    "admin-dashboard": "Dashboard",
    "admin-users": "Users",
    "admin-jobs": "Jobs",
    "admin-applications": "Applications",
    "employer-dashboard": "Dashboard",
    "employer-post-job": "Post Job",
    "employer-my-jobs": "My Jobs",
    "jobseeker-dashboard": "Dashboard",
    "jobseeker-browse-jobs": "Browse Jobs",
    "jobseeker-applications": "My Applications",
    "profile": "Profile",
    "settings": "Settings",
  };
  return titles[section] || "";
}

/**
 * Sidebar must only collapse when the menu button is clicked, not on hover/overlay.
 * Only on desktop (>=992px). On mobile, use theme default (tap overlay to close).
 */
function preventSidebarCollapseOnHover() {
  var collapseAllowed = false;
  var collapseAllowedTimeout = null;

  var btn = document.querySelector('[data-widget="pushmenu"]');
  if (btn) {
    /* Capture phase so we set the flag before AdminLTE's handler runs */
    btn.addEventListener(
      "click",
      function () {
        collapseAllowed = true;
        if (collapseAllowedTimeout) clearTimeout(collapseAllowedTimeout);
        collapseAllowedTimeout = setTimeout(function () {
          collapseAllowed = false;
          collapseAllowedTimeout = null;
        }, 300);
      },
      true
    );
  }

  var observer = new MutationObserver(function (mutations) {
    if (window.innerWidth < 992) return; /* mobile: allow theme behavior */
    mutations.forEach(function (mutation) {
      if (mutation.attributeName !== "class") return;
      var body = document.body;
      /* When sidebar is open (no sidebar-collapse) and we didn't allow it, close it again */
      if (!body.classList.contains("sidebar-collapse") && !collapseAllowed) {
        body.classList.add("sidebar-collapse");
        body.classList.remove("sidebar-open");
      }
    });
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
}

/** Ensure sidebar starts closed on every page load (override AdminLTE remember or any default open). */
function showPrivacyBannerIfNeeded() {
  try {
    if (window.localStorage && window.localStorage.getItem("privacy_banner_dismissed")) return;
  } catch (e) { return; }
  var section = document.querySelector(".content-wrapper .content");
  if (!section) return;
  var wrapper = document.createElement("div");
  wrapper.className = "container-fluid";
  var banner = document.createElement("div");
  banner.id = "privacyWelcomeBanner";
  banner.className = "alert alert-info alert-dismissible fade show mb-3";
  banner.setAttribute("role", "alert");
  banner.innerHTML =
    'We value your privacy. Please review our <a href="privacy.html" target="_blank" rel="noopener">Privacy Policy</a>.' +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close" id="privacyBannerDismiss">' +
    '<span aria-hidden="true">&times;</span></button>';
  wrapper.appendChild(banner);
  section.insertBefore(wrapper, section.firstChild);
  var dismissBtn = document.getElementById("privacyBannerDismiss");
  if (dismissBtn) {
    dismissBtn.addEventListener("click", function () {
      try {
        if (window.localStorage) window.localStorage.setItem("privacy_banner_dismissed", "1");
      } catch (e) {}
      var b = document.getElementById("privacyWelcomeBanner");
      if (b && b.parentNode) b.parentNode.remove();
    });
  }
}

function ensureSidebarClosedOnLoad() {
  document.body.classList.add("sidebar-collapse");
  document.body.classList.remove("sidebar-open");
  try {
    if (window.localStorage) localStorage.removeItem("remember.lte.pushmenu");
  } catch (e) {}
  window.addEventListener("load", function () {
    document.body.classList.add("sidebar-collapse");
    document.body.classList.remove("sidebar-open");
    setTimeout(function () {
      document.body.classList.add("sidebar-collapse");
      document.body.classList.remove("sidebar-open");
    }, 50);
    setTimeout(function () {
      document.body.classList.add("sidebar-collapse");
      document.body.classList.remove("sidebar-open");
    }, 200);
  });
}

// Admin views – overview stats and lists (per requirements)
function loadAdminDashboard() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/admin/stats/overview", "GET", null, true)
    .then(function (stats) {
      var html =
        '<div class="row mb-4">' +
        '<div class="col-md-4 col-lg-2 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white"><div class="card-body py-3">' +
        '<h6 class="mb-0">Users</h6><h4 class="mb-0">' + (stats.total_users || 0) + '</h4></div></div></div>' +
        '<div class="col-md-4 col-lg-2 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white"><div class="card-body py-3">' +
        '<h6 class="mb-0">Employers</h6><h4 class="mb-0">' + (stats.total_employers || 0) + '</h4></div></div></div>' +
        '<div class="col-md-4 col-lg-2 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white"><div class="card-body py-3">' +
        '<h6 class="mb-0">Jobseekers</h6><h4 class="mb-0">' + (stats.total_jobseekers || 0) + '</h4></div></div></div>' +
        '<div class="col-md-4 col-lg-2 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white"><div class="card-body py-3">' +
        '<h6 class="mb-0">Jobs</h6><h4 class="mb-0">' + (stats.total_jobs || 0) + '</h4></div></div></div>' +
        '<div class="col-md-4 col-lg-2 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white"><div class="card-body py-3">' +
        '<h6 class="mb-0">Applications</h6><h4 class="mb-0">' + (stats.total_applications || 0) + '</h4></div></div></div>' +
        '</div>';
      html +=
        '<div class="mb-3">' +
        '<label class="mr-2">Stats by period:</label>' +
        '<div class="btn-group btn-group-sm" role="group" id="adminPeriodSelector">' +
        '<button type="button" class="btn btn-primary active" data-period="daily">Daily</button>' +
        '<button type="button" class="btn btn-outline-primary" data-period="weekly">Weekly</button>' +
        '<button type="button" class="btn btn-outline-primary" data-period="monthly">Monthly</button>' +
        '<button type="button" class="btn btn-outline-primary" data-period="yearly">Yearly</button>' +
        '</div></div>' +
        '<div class="row" id="adminPeriodStatsRow">' +
        '<div class="col-12"><div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading period stats...</div></div>' +
        '</div>';
      el.innerHTML = html;
      bindAdminPeriodSelector();
      loadAdminPeriodStats("daily");
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function bindAdminPeriodSelector() {
  var row = document.getElementById("adminPeriodStatsRow");
  var btns = document.querySelectorAll("#adminPeriodSelector [data-period]");
  if (!row || !btns.length) return;
  btns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      btns.forEach(function (b) {
        b.classList.remove("active");
        b.classList.remove("btn-primary");
        b.classList.add("btn-outline-primary");
      });
      btn.classList.add("active");
      btn.classList.add("btn-primary");
      btn.classList.remove("btn-outline-primary");
      var period = btn.getAttribute("data-period");
      loadAdminPeriodStats(period);
    });
  });
}

function loadAdminPeriodStats(period) {
  var row = document.getElementById("adminPeriodStatsRow");
  if (!row) return;
  row.innerHTML = '<div class="col-12"><div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div></div>';

  Promise.all([
    apiRequest("/admin/stats/jobs?period=" + encodeURIComponent(period), "GET", null, true),
    apiRequest("/admin/stats/users?period=" + encodeURIComponent(period), "GET", null, true),
  ])
    .then(function (responses) {
      var jobsData = (responses[0] && responses[0].data) ? responses[0].data : [];
      var usersData = (responses[1] && responses[1].data) ? responses[1].data : [];
      var periodLabel = period.charAt(0).toUpperCase() + period.slice(1);

      var jobsHtml =
        '<div class="col-md-6 mb-3">' +
        '<div class="card"><div class="card-header"><h6 class="mb-0">Jobs posted by ' + periodLabel + '</h6></div>' +
        '<div class="card-body p-0">';
      if (jobsData.length === 0) {
        jobsHtml += '<div class="p-3 text-muted">No data for this period.</div>';
      } else {
        jobsHtml += '<div class="table-responsive"><table class="table table-sm table-hover mb-0"><thead><tr><th>Period</th><th>Count</th></tr></thead><tbody>';
        jobsData.forEach(function (item) {
          jobsHtml += "<tr><td>" + escapeHtml(String(item.period)) + "</td><td>" + (item.count || 0) + "</td></tr>";
        });
        jobsHtml += "</tbody></table></div>";
      }
      jobsHtml += "</div></div></div>";

      var usersHtml =
        '<div class="col-md-6 mb-3">' +
        '<div class="card"><div class="card-header"><h6 class="mb-0">Registrations by ' + periodLabel + '</h6></div>' +
        '<div class="card-body p-0">';
      if (usersData.length === 0) {
        usersHtml += '<div class="p-3 text-muted">No data for this period.</div>';
      } else {
        usersHtml += '<div class="table-responsive"><table class="table table-sm table-hover mb-0"><thead><tr><th>Period</th><th>Count</th></tr></thead><tbody>';
        usersData.forEach(function (item) {
          usersHtml += "<tr><td>" + escapeHtml(String(item.period)) + "</td><td>" + (item.count || 0) + "</td></tr>";
        });
        usersHtml += "</tbody></table></div>";
      }
      usersHtml += "</div></div></div>";

      row.innerHTML = jobsHtml + usersHtml;
    })
    .catch(function (err) {
      row.innerHTML = '<div class="col-12"><div class="alert alert-danger">' + escapeHtml(err.message || "Failed to load period stats.") + "</div></div>";
    });
}

function loadAdminUsers() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/admin/users", "GET", null, true)
    .then(function (users) {
      var html = '<div class="card"><div class="card-body p-0">';
      if (!users || users.length === 0) {
        html += '<div class="p-4 text-center text-muted">No users yet.</div>';
      } else {
        html +=
          '<div class="table-responsive"><table class="table table-hover mb-0">' +
          '<thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th width="140">Actions</th></tr></thead><tbody>';
        users.forEach(function (u) {
          var statusBadge = u.is_active !== false ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-secondary">Inactive</span>';
          html +=
            "<tr>" +
            "<td>" + u.id + "</td>" +
            "<td>" + escapeHtml(u.name || "—") + "</td>" +
            "<td>" + escapeHtml(u.email || "—") + "</td>" +
            "<td>" + escapeHtml(String(u.role)) + "</td>" +
            "<td>" + statusBadge + "</td>" +
            '<td class="dash-actions-cell">' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-icon" title="' + (u.is_active !== false ? "Deactivate" : "Activate") + '" data-user-id="' + u.id + '" onclick="adminToggleUser(this)"><i class="fas fa-user-' + (u.is_active !== false ? "slash" : "check") + '"></i></button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-icon" title="Delete" data-user-id="' + u.id + '" data-user-name="' + escapeHtml(u.name || "") + '" onclick="adminDeleteUser(this)"><i class="fas fa-trash-alt"></i></button>' +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function adminToggleUser(btn) {
  var userId = parseInt(btn.getAttribute("data-user-id"), 10);
  btn.disabled = true;
  apiRequest("/admin/users/" + userId + "/toggle", "PATCH", null, true)
    .then(function () {
      loadAdminUsers();
    })
    .catch(function (err) {
      btn.disabled = false;
      alert(err.message || "Failed to update user.");
    });
}

function adminDeleteUser(btn) {
  var userId = parseInt(btn.getAttribute("data-user-id"), 10);
  var name = btn.getAttribute("data-user-name") || ("User #" + userId);
  if (!confirm("Delete user \"" + name + "\"? This cannot be undone.")) return;
  btn.disabled = true;
  apiRequest("/admin/users/" + userId, "DELETE", null, true)
    .then(function () {
      loadAdminUsers();
    })
    .catch(function (err) {
      btn.disabled = false;
      alert(err.message || "Failed to delete user.");
    });
}

function loadAdminJobs() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/admin/jobs", "GET", null, true)
    .then(function (jobs) {
      var html = '<div class="card"><div class="card-body p-0">';
      if (!jobs || jobs.length === 0) {
        html += '<div class="p-4 text-center text-muted">No jobs yet.</div>';
      } else {
        html +=
          '<div class="table-responsive"><table class="table table-hover mb-0">' +
          '<thead><tr><th>ID</th><th>Title</th><th>Location</th><th>Employer ID</th><th>Date Posted</th><th width="100">Actions</th></tr></thead><tbody>';
        jobs.forEach(function (job) {
          html +=
            "<tr>" +
            "<td>" + job.id + "</td>" +
            "<td>" + escapeHtml(job.title || "—") + "</td>" +
            "<td>" + escapeHtml(job.location || "—") + "</td>" +
            "<td>" + job.employer_id + "</td>" +
            '<td class="text-nowrap">' + formatDate(job.created_at) + "</td>" +
            '<td class="dash-actions-cell">' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-icon" title="Delete" data-job-id="' + job.id + '" data-job-title="' + escapeHtml(job.title || "") + '" onclick="adminDeleteJob(this)"><i class="fas fa-trash-alt"></i></button>' +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function adminDeleteJob(btn) {
  var jobId = parseInt(btn.getAttribute("data-job-id"), 10);
  var title = btn.getAttribute("data-job-title") || ("Job #" + jobId);
  if (!confirm("Delete job \"" + title + "\"? This cannot be undone.")) return;
  btn.disabled = true;
  apiRequest("/admin/jobs/" + jobId, "DELETE", null, true)
    .then(function () {
      loadAdminJobs();
    })
    .catch(function (err) {
      btn.disabled = false;
      alert(err.message || "Failed to delete job.");
    });
}

function loadAdminApplications() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/admin/applications", "GET", null, true)
    .then(function (applications) {
      var html = '<div class="card"><div class="card-body p-0">';
      if (!applications || applications.length === 0) {
        html += '<div class="p-4 text-center text-muted">No applications yet.</div>';
      } else {
        html +=
          '<div class="table-responsive"><table class="table table-hover mb-0">' +
          '<thead><tr><th>ID</th><th>Job ID</th><th>Jobseeker ID</th><th>Status</th><th>Applied</th></tr></thead><tbody>';
        applications.forEach(function (app) {
          html +=
            "<tr>" +
            "<td>" + app.id + "</td>" +
            "<td>" + app.job_id + "</td>" +
            "<td>" + app.jobseeker_id + "</td>" +
            "<td>" + escapeHtml(app.status || "—") + "</td>" +
            '<td class="text-nowrap">' + formatDate(app.applied_at) + "</td>" +
            "</tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function loadEmployerDashboard() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/jobs/my/stats", "GET", null, true)
    .then(function (stats) {
      var jobsHtml =
        '<div class="row mb-4">' +
        '<div class="col-md-4 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white">' +
        '<div class="card-body py-3">' +
        '<h6 class="mb-0">My Jobs</h6>' +
        '<h4 class="mb-0">' + stats.total_jobs + '</h4>' +
        '</div></div></div>' +
        '<div class="col-md-4 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white">' +
        '<div class="card-body py-3">' +
        '<h6 class="mb-0">Total Applications</h6>' +
        '<h4 class="mb-0">' + stats.total_applications + '</h4>' +
        '</div></div></div>' +
        '</div>';

      if (!stats.hot_jobs || stats.hot_jobs.length === 0) {
        jobsHtml +=
          '<div class="card"><div class="card-body text-center text-muted">' +
          "You haven't posted any jobs yet. <a href='#' onclick='handleSectionClick(\"employer-post-job\"); return false;'>Post your first job</a>.</div></div>";
      } else {
        jobsHtml +=
          '<div class="card"><div class="card-header"><h6 class="mb-0">Hot Jobs Ranking</h6></div><div class="card-body p-0">' +
          '<table class="table table-sm table-hover mb-0">' +
          '<thead><tr><th>Job</th><th>Date Posted</th><th>Total Applicants</th><th></th></tr></thead><tbody>';
        stats.hot_jobs.forEach(function (job, idx) {
          jobsHtml +=
            '<tr>' +
            '<td>' + escapeHtml(job.title) + ' <span class="text-muted small">' + escapeHtml(job.location) + '</span></td>' +
            '<td class="text-nowrap">' + formatDate(job.created_at) + '</td>' +
            '<td>' + job.applicant_count + '</td>' +
            '<td><a href="#" class="btn btn-sm btn-outline-primary" onclick="showJobDetailModalFromId(' + job.id + '); return false;">View Job</a></td>' +
            '</tr>';
        });
        jobsHtml += '</tbody></table></div></div>';
      }
      el.innerHTML = jobsHtml;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + '</div>';
    });
}

function loadEmployerPostJobForm() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML =
    '<div class="card"><div class="card-body">' +
    '<form id="employerPostJobForm">' +
    '<div class="form-group"><label for="jobTitle">Title</label><input type="text" id="jobTitle" class="form-control" placeholder="Job title" required minlength="2" maxlength="200" /></div>' +
    '<div class="form-group"><label for="jobLocation">Location</label><input type="text" id="jobLocation" class="form-control" placeholder="e.g. Remote, New York" required minlength="2" maxlength="200" /></div>' +
    '<div class="form-group"><label for="jobDescription">Description</label><textarea id="jobDescription" class="form-control" rows="4" placeholder="Job description" required minlength="10"></textarea></div>' +
    '<div id="postJobError" class="alert alert-danger d-none mb-2"></div>' +
    '<div id="postJobSuccess" class="alert alert-success d-none mb-2"></div>' +
    '<button type="submit" class="btn btn-primary">Post job</button>' +
    "</form></div></div>";

  document.getElementById("employerPostJobForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var errEl = document.getElementById("postJobError");
    var okEl = document.getElementById("postJobSuccess");
    errEl.classList.add("d-none");
    okEl.classList.add("d-none");
    var title = document.getElementById("jobTitle").value.trim();
    var location = document.getElementById("jobLocation").value.trim();
    var description = document.getElementById("jobDescription").value.trim();
    if (!title || !location || !description) {
      errEl.textContent = "Please fill all fields.";
      errEl.classList.remove("d-none");
      return;
    }
    if (description.length < 10) {
      errEl.textContent = "Description must be at least 10 characters.";
      errEl.classList.remove("d-none");
      return;
    }
    apiRequest("/jobs", "POST", { title: title, location: location, description: description }, true)
      .then(function () {
        showJobPostedToast();
      })
      .catch(function (err) {
        errEl.textContent = err.message || "Failed to post job.";
        errEl.classList.remove("d-none");
      });
  });
}

function showJobseekerAppliedToast() {
  var existing = document.getElementById("dashJobseekerAppliedToast");
  if (existing) existing.remove();
  var toast = document.createElement("div");
  toast.id = "dashJobseekerAppliedToast";
  toast.className = "dash-toast dash-toast-show";
  toast.setAttribute("role", "alert");
  toast.innerHTML = '<i class="fas fa-check-circle"></i> Application submitted.';
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.classList.remove("dash-toast-show");
    setTimeout(function () { toast.remove(); }, 300);
  }, 2000);
}

function showJobPostedToast() {
  var existing = document.getElementById("dashJobPostedToast");
  if (existing) existing.remove();
  var toast = document.createElement("div");
  toast.id = "dashJobPostedToast";
  toast.className = "dash-toast dash-toast-show";
  toast.setAttribute("role", "alert");
  toast.innerHTML = '<i class="fas fa-check-circle"></i> Job posted successfully. Redirecting to dashboard…';
  document.body.appendChild(toast);
  setTimeout(function () {
    toast.classList.remove("dash-toast-show");
    setTimeout(function () {
      var menu = document.getElementById("sidebarMenu");
      if (menu) {
        menu.querySelectorAll(".nav-link").forEach(function (l) {
          l.classList.remove("active");
          if (l.getAttribute("data-section") === "employer-dashboard") l.classList.add("active");
        });
      }
      handleSectionClick("employer-dashboard");
      toast.remove();
    }, 300);
  }, 2000);
}

function formatDate(isoStr) {
  if (!isoStr) return "—";
  var d = new Date(isoStr);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function loadEmployerJobs() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/jobs/my", "GET", null, true)
    .then(function (jobs) {
      var html =
        '<div class="card"><div class="card-body p-0">';

      if (jobs.length === 0) {
        html += '<div class="p-4 text-center text-muted">No jobs yet. <a href="#" onclick="handleSectionClick(\'employer-post-job\'); return false;">Post a job</a>.</div>';
      } else {
        html += '<div class="table-responsive"><table class="table table-hover mb-0"><thead><tr><th>Title</th><th>Location</th><th>Date Posted</th><th>Description</th><th width="140">Actions</th></tr></thead><tbody>';
        jobs.forEach(function (job, idx) {
          var desc = (job.description || "").substring(0, 50);
          if ((job.description || "").length > 50) desc += "...";
          html +=
            "<tr>" +
            "<td>" + escapeHtml(job.title) + "</td>" +
            "<td>" + escapeHtml(job.location) + "</td>" +
            '<td class="text-nowrap">' + formatDate(job.created_at) + "</td>" +
            '<td class="text-muted small">' + escapeHtml(desc) + "</td>" +
            '<td class="dash-actions-cell">' +
            '<button type="button" class="btn btn-sm btn-outline-primary btn-icon" title="Applications" data-job-id="' + job.id + '" data-job-title="' + escapeHtml(job.title) + '" onclick="employerViewApplicationsFromBtn(this)"><i class="fas fa-file-alt"></i></button>' +
            '<button type="button" class="btn btn-sm btn-outline-secondary btn-icon" title="Edit" onclick="employerEditJob(' + job.id + ')"><i class="fas fa-edit"></i></button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-icon" title="Delete" data-job-id="' + job.id + '" data-job-title="' + escapeHtml(job.title) + '" onclick="employerDeleteJobFromBtn(this)"><i class="fas fa-trash-alt"></i></button>' +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function employerViewApplications(jobId, jobTitle) {
  var titleForDisplay = jobTitle || "Job #" + jobId;
  function renderApplicationsModal(apps) {
    var rows = apps.length
      ? apps.map(function (a) {
          var date = a.applied_at ? new Date(a.applied_at).toLocaleString() : "";
          var name = escapeHtml(a.jobseeker_name || "—");
          var email = escapeHtml(a.jobseeker_email || "—");
          var skills = escapeHtml((a.jobseeker_skills || "—").substring(0, 80));
          if ((a.jobseeker_skills || "").length > 80) skills += "…";
          var location = escapeHtml(a.jobseeker_location || "—");
          var status = escapeHtml(a.status || "pending");
          var seenBtn = (a.status || "").toLowerCase() === "seen"
            ? '<span class="badge badge-success">Seen</span>'
            : '<button type="button" class="btn btn-sm btn-outline-primary" data-application-id="' + a.id + '" data-job-id="' + jobId + '" onclick="employerSetApplicationSeen(this)">Mark as Seen</button>';
          return "<tr><td>" + name + "</td><td>" + email + "</td><td class=\"small\">" + skills + "</td><td>" + location + "</td><td>" + status + "</td><td class=\"text-nowrap\">" + date + "</td><td>" + seenBtn + "</td></tr>";
        }).join("")
      : "<tr><td colspan='7' class='text-center text-muted'>No applications yet.</td></tr>";
    var thead = "<thead><tr><th>Name</th><th>Email</th><th>Skills</th><th>Location</th><th>Status</th><th>Applied</th><th>Action</th></tr></thead>";
    return thead + "<tbody>" + rows + "</tbody>";
  }

  apiRequest("/applications/job/" + jobId, "GET", null, true)
    .then(function (applications) {
      var tableBody = renderApplicationsModal(applications);
      var modalHtml =
        '<div class="modal fade" id="employerApplicationsModal" tabindex="-1">' +
        '<div class="modal-dialog modal-xl"><div class="modal-content">' +
        '<div class="modal-header"><h6 class="modal-title">Applications: ' + escapeHtml(titleForDisplay) + '</h6><button type="button" class="close" data-dismiss="modal"><span>&times;</span></button></div>' +
        '<div class="modal-body p-0">' +
        '<div class="table-responsive"><table class="table table-sm mb-0">' + tableBody + '</table></div>' +
        '</div></div></div></div>';
      var existing = document.getElementById("employerApplicationsModal");
      if (existing) existing.remove();
      var wrap = document.createElement("div");
      wrap.innerHTML = modalHtml;
      document.body.appendChild(wrap.firstElementChild);
      var modal = document.getElementById("employerApplicationsModal");
      modal.setAttribute("data-employer-applications-job-id", jobId);
      modal.setAttribute("data-employer-applications-job-title", titleForDisplay);
      $(modal).modal("show");
      $(modal).on("hidden.bs.modal", function () {
        modal.remove();
      });
    })
    .catch(function (err) {
      alert(err.message || "Failed to load applications.");
    });
}

function employerSetApplicationSeen(btn) {
  var applicationId = parseInt(btn.getAttribute("data-application-id"), 10);
  var jobId = btn.getAttribute("data-job-id");
  var jobTitle = document.getElementById("employerApplicationsModal") && document.getElementById("employerApplicationsModal").getAttribute("data-employer-applications-job-title");
  btn.disabled = true;
  apiRequest("/applications/" + applicationId + "/status", "PUT", { status: "Seen" }, true)
    .then(function () {
      return apiRequest("/applications/job/" + jobId, "GET", null, true);
    })
    .then(function (applications) {
      var modal = document.getElementById("employerApplicationsModal");
      if (!modal) return;
      var tbody = modal.querySelector(".table-responsive table tbody");
      var thead = modal.querySelector(".table-responsive table thead");
      if (!tbody || !thead) return;
      var rows = applications.length
        ? applications.map(function (a) {
            var date = a.applied_at ? new Date(a.applied_at).toLocaleString() : "";
            var name = escapeHtml(a.jobseeker_name || "—");
            var email = escapeHtml(a.jobseeker_email || "—");
            var skills = escapeHtml((a.jobseeker_skills || "—").substring(0, 80));
            if ((a.jobseeker_skills || "").length > 80) skills += "…";
            var location = escapeHtml(a.jobseeker_location || "—");
            var status = escapeHtml(a.status || "pending");
            var seenBtn = (a.status || "").toLowerCase() === "seen"
              ? '<span class="badge badge-success">Seen</span>'
              : '<button type="button" class="btn btn-sm btn-outline-primary" data-application-id="' + a.id + '" data-job-id="' + jobId + '" onclick="employerSetApplicationSeen(this)">Mark as Seen</button>';
            return "<tr><td>" + name + "</td><td>" + email + "</td><td class=\"small\">" + skills + "</td><td>" + location + "</td><td>" + status + "</td><td class=\"text-nowrap\">" + date + "</td><td>" + seenBtn + "</td></tr>";
          }).join("")
        : "<tr><td colspan='7' class='text-center text-muted'>No applications yet.</td></tr>";
      tbody.innerHTML = rows;
    })
    .catch(function (err) {
      btn.disabled = false;
      alert(err.message || "Failed to update status.");
    });
}

function employerViewApplicationsFromBtn(btn) {
  var id = parseInt(btn.getAttribute("data-job-id"), 10);
  var title = btn.getAttribute("data-job-title") || "";
  employerViewApplications(id, title);
}

function employerEditJob(jobId) {
  apiRequest("/jobs/my", "GET", null, true).then(function (jobs) {
    var job = jobs.filter(function (j) {
      return j.id === jobId;
    })[0];
    if (!job) {
      alert("Job not found.");
      return;
    }
    var el = getMainContainer();
    var formHtml =
      '<h5 class="mb-3">Edit job</h5>' +
      '<div class="card"><div class="card-body">' +
      '<form id="employerEditJobForm">' +
      '<input type="hidden" id="editJobId" value="' + jobId + '" />' +
      '<div class="form-group"><label for="editJobTitle">Title</label><input type="text" id="editJobTitle" class="form-control" required minlength="2" maxlength="200" /></div>' +
      '<div class="form-group"><label for="editJobLocation">Location</label><input type="text" id="editJobLocation" class="form-control" required minlength="2" maxlength="200" /></div>' +
      '<div class="form-group"><label for="editJobDescription">Description</label><textarea id="editJobDescription" class="form-control" rows="4" required minlength="10"></textarea></div>' +
      '<div id="editJobError" class="alert alert-danger d-none mb-2"></div>' +
      '<button type="submit" class="btn btn-primary mr-2">Save</button>' +
      '<button type="button" class="btn btn-secondary" onclick="loadEmployerJobs()">Cancel</button>' +
      "</form></div></div>";
    el.innerHTML = formHtml;
    document.getElementById("editJobTitle").value = job.title || "";
    document.getElementById("editJobLocation").value = job.location || "";
    document.getElementById("editJobDescription").value = job.description || "";
    document.getElementById("employerEditJobForm").addEventListener("submit", function (e) {
      e.preventDefault();
      var errEl = document.getElementById("editJobError");
      errEl.classList.add("d-none");
      var id = parseInt(document.getElementById("editJobId").value, 10);
      var title = document.getElementById("editJobTitle").value.trim();
      var location = document.getElementById("editJobLocation").value.trim();
      var description = document.getElementById("editJobDescription").value.trim();
      if (!title || !location || !description || description.length < 10) {
        errEl.textContent = "Please fill all fields. Description at least 10 characters.";
        errEl.classList.remove("d-none");
        return;
      }
      apiRequest("/jobs/" + id, "PUT", { title: title, location: location, description: description }, true)
        .then(function () {
          loadEmployerJobs();
        })
        .catch(function (err) {
          errEl.textContent = err.message || "Failed to update job.";
          errEl.classList.remove("d-none");
        });
    });
  });
}

function employerDeleteJob(jobId, jobTitle) {
  if (!confirm("Delete job \"" + jobTitle + "\"? This cannot be undone.")) return;
  apiRequest("/jobs/" + jobId, "DELETE", null, true)
    .then(function () {
      loadEmployerJobs();
    })
    .catch(function (err) {
      alert(err.message || "Failed to delete job.");
    });
}

function employerDeleteJobFromBtn(btn) {
  var id = parseInt(btn.getAttribute("data-job-id"), 10);
  var title = btn.getAttribute("data-job-title") || "this job";
  employerDeleteJob(id, title);
}

function escapeHtml(str) {
  if (str == null) return "";
  var s = String(str);
  var div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function loadJobseekerDashboard() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  Promise.all([
    apiRequest("/applications/my", "GET", null, true),
    apiRequest("/jobs", "GET", null, true),
  ])
    .then(function (results) {
      var applications = results[0];
      var jobs = results[1];
      var jobMap = {};
      jobs.forEach(function (j) {
        jobMap[j.id] = j;
      });

      var totalApps = applications.length;
      var recentApps = applications.slice(0, 5);

      var html =
        '<div class="row mb-4">' +
        '<div class="col-md-4 mb-3 mb-md-0">' +
        '<div class="card dash-stat-card text-white">' +
        '<div class="card-body py-3">' +
        '<h6 class="mb-0">My Applications</h6>' +
        '<h4 class="mb-0">' + totalApps + '</h4>' +
        '</div></div></div></div>';

      if (recentApps.length === 0) {
        html +=
          '<div class="card"><div class="card-body text-center text-muted">' +
          "You haven't applied to any jobs yet. <a href='#' onclick='handleSectionClick(\"jobseeker-browse-jobs\"); return false;'>Browse jobs</a> to apply.</div></div>";
      } else {
        html +=
          '<div class="card"><div class="card-header"><h6 class="mb-0">Recent Applications</h6></div><div class="card-body p-0">' +
          '<table class="table table-sm table-hover mb-0">' +
          '<thead><tr><th>Job</th><th>Company</th><th>Status</th><th>Applied</th><th></th></tr></thead><tbody>';
        recentApps.forEach(function (app) {
          var job = jobMap[app.job_id];
          var jobTitle = job ? escapeHtml(job.title) : "Job #" + app.job_id;
          var jobCompany = job && job.company && job.company.trim() ? escapeHtml(job.company) : "—";
          var jobLoc = job ? escapeHtml(job.location) : "";
          html +=
            '<tr>' +
            '<td>' + jobTitle + (jobLoc ? ' <span class="text-muted small">' + jobLoc + "</span>" : "") + "</td>" +
            '<td>' + jobCompany + '</td>' +
            '<td>' + escapeHtml(app.status) + '</td>' +
            '<td class="text-nowrap">' + formatDate(app.applied_at) + '</td>' +
            '<td><a href="#" class="btn btn-sm btn-outline-primary" data-job-id="' + app.job_id + '" onclick="showJobDetailModalFromId(' + app.job_id + '); return false;">View job</a></td>' +
            "</tr>";
        });
        html += "</tbody></table></div></div>";
      }
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function loadJobseekerBrowseJobs() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  Promise.all([
    apiRequest("/jobs", "GET", null, true),
    apiRequest("/applications/my", "GET", null, true),
  ])
    .then(function (results) {
      var jobs = results[0];
      var applications = results[1];
      var appliedJobIds = {};
      applications.forEach(function (app) {
        appliedJobIds[app.job_id] = true;
      });

      var availableJobs = jobs.filter(function (job) { return !appliedJobIds[job.id]; });

      var html =
        '<div class="card"><div class="card-body p-0">';

      if (availableJobs.length === 0) {
        html += '<div class="p-4 text-center text-muted">No jobs available to apply. Applied jobs are listed under My Applications.</div>';
      } else {
        html +=
          '<div class="table-responsive"><table class="table table-hover mb-0">' +
          '<thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Date Posted</th><th width="120">Action</th></tr></thead><tbody>';
        availableJobs.forEach(function (job) {
          var company = (job.company && job.company.trim()) ? escapeHtml(job.company) : "—";
          html +=
            "<tr>" +
            "<td>" + escapeHtml(job.title) + "</td>" +
            "<td>" + company + "</td>" +
            "<td>" + escapeHtml(job.location) + "</td>" +
            '<td class="text-nowrap">' + formatDate(job.created_at) + "</td>" +
            "<td>" +
            '<button type="button" class="btn btn-sm btn-primary" data-job-id="' + job.id + '" onclick="jobseekerApplyToJob(this)">Apply</button>' +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function jobseekerApplyToJob(btn) {
  var jobId = parseInt(btn.getAttribute("data-job-id"), 10);
  btn.disabled = true;
  btn.textContent = "Applying…";
  apiRequest("/applications/" + jobId, "POST", null, true)
    .then(function () {
      showJobseekerAppliedToast();
      loadJobseekerBrowseJobs();
    })
    .catch(function (err) {
      btn.disabled = false;
      btn.textContent = "Apply";
      alert(err.message || "Failed to apply.");
    });
}

function showJobDetailModalFromId(jobId) {
  apiRequest("/jobs/" + jobId, "GET", null, true)
    .then(function (job) {
      showJobDetailModal(job);
    })
    .catch(function (err) {
      alert(err.message || "Failed to load job details.");
    });
}

function showJobDetailModal(job) {
  var modalId = "jobDetailModal";
  var existing = document.getElementById(modalId);
  if (existing) existing.remove();
  var companyVal = (job.company && job.company.trim()) ? escapeHtml(job.company) : "—";
  var locationVal = (job.location && job.location.trim()) ? escapeHtml(job.location) : "—";
  var descVal = (job.description && job.description.trim()) ? escapeHtml(String(job.description).replace(/\n/g, "<br>")) : "—";
  var html =
    '<div class="modal fade" id="' + modalId + '" tabindex="-1">' +
    '<div class="modal-dialog"><div class="modal-content">' +
    '<div class="modal-header"><h6 class="modal-title">' + escapeHtml(job.title || "Job") + '</h6><button type="button" class="close" data-dismiss="modal"><span>&times;</span></button></div>' +
    '<div class="modal-body">' +
    '<p class="mb-2"><strong>Company:</strong> ' + companyVal + '</p>' +
    '<p class="mb-2"><strong>Location:</strong> ' + locationVal + '</p>' +
    '<p class="mb-0"><strong>Description:</strong></p><p class="text-muted">' + descVal + '</p>' +
    '</div></div></div></div>';
  document.body.insertAdjacentHTML("beforeend", html);
  var modal = document.getElementById(modalId);
  if (window.jQuery && modal) {
    window.jQuery(modal).modal("show");
    modal.addEventListener("hidden.bs.modal", function onHidden() {
      modal.remove();
    }, { once: true });
  }
}

function jobseekerWithdrawApplication(btn) {
  var applicationId = parseInt(btn.getAttribute("data-application-id"), 10);
  if (!confirm("Withdraw this application?")) return;
  btn.disabled = true;
  apiRequest("/applications/" + applicationId, "DELETE", null, true)
    .then(function () {
      loadJobseekerApplications();
      loadJobseekerBrowseJobs();
    })
    .catch(function (err) {
      btn.disabled = false;
      alert(err.message || "Failed to withdraw application.");
    });
}

function loadJobseekerApplications() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  Promise.all([
    apiRequest("/applications/my", "GET", null, true),
    apiRequest("/jobs", "GET", null, true),
  ])
    .then(function (results) {
      var applications = results[0];
      var jobs = results[1];
      var jobMap = {};
      jobs.forEach(function (j) {
        jobMap[j.id] = j;
      });

      var html =
        '<div class="card"><div class="card-body p-0">';

      if (applications.length === 0) {
        html +=
          '<div class="p-4 text-center text-muted">No applications yet. <a href="#" onclick="handleSectionClick(\'jobseeker-browse-jobs\'); return false;">Browse jobs</a> to apply.</div>';
      } else {
        html +=
          '<div class="table-responsive"><table class="table table-hover mb-0">' +
          "<thead><tr><th>Job Title</th><th>Company</th><th>Location</th><th>Status</th><th>Applied</th><th width=\"180\">Actions</th></tr></thead><tbody>";
        applications.forEach(function (app) {
          var job = jobMap[app.job_id];
          var title = job ? escapeHtml(job.title) : "Job #" + app.job_id;
          var company = job && job.company && job.company.trim() ? escapeHtml(job.company) : "—";
          var loc = job ? escapeHtml(job.location) : "—";
          html +=
            "<tr>" +
            "<td>" + title + "</td>" +
            "<td>" + company + "</td>" +
            "<td>" + loc + "</td>" +
            "<td>" + escapeHtml(app.status) + "</td>" +
            '<td class="text-nowrap">' + formatDate(app.applied_at) + "</td>" +
            '<td class="dash-actions-cell">' +
            '<button type="button" class="btn btn-sm btn-outline-primary btn-icon mr-1" title="View job" onclick="showJobDetailModalFromId(' + app.job_id + ')"><i class="fas fa-eye"></i></button>' +
            '<button type="button" class="btn btn-sm btn-outline-danger btn-icon" title="Withdraw application" data-application-id="' + app.id + '" onclick="jobseekerWithdrawApplication(this)"><i class="fas fa-times"></i></button>' +
            "</td></tr>";
        });
        html += "</tbody></table></div>";
      }
      html += "</div></div>";
      el.innerHTML = html;
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function loadProfileSettings() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/users/me", "GET", null, true)
    .then(function (user) {
      var role = (currentUser && currentUser.role) || user.role;
      var html;
      if (role === "admin") {
        var about = (user.about != null) ? String(user.about) : "";
        html =
          '<div class="card"><div class="card-body">' +
          '<form id="profileForm">' +
          '<div class="form-group"><label for="profileName">Name</label><input type="text" id="profileName" class="form-control" placeholder="Your name" required minlength="2" maxlength="100" value="' + escapeHtml(user.name || "") + '" /></div>' +
          '<div class="form-group"><label for="profileAbout">About</label><textarea id="profileAbout" class="form-control" rows="4" placeholder="A short bio or description" maxlength="1000">' + escapeHtml(about) + '</textarea></div>' +
          '<div id="profileError" class="alert alert-danger d-none mb-2"></div>' +
          '<div id="profileSuccess" class="alert alert-success d-none mb-2"></div>' +
          '<button type="submit" class="btn btn-primary">Save profile</button>' +
          "</form></div></div>";
      } else if (role === "employer") {
        var designation = (user.designation != null) ? String(user.designation) : "";
        var company = (user.company != null) ? String(user.company) : "";
        html =
          '<div class="card"><div class="card-body">' +
          '<form id="profileForm">' +
          '<div class="form-group"><label for="profileName">Name</label><input type="text" id="profileName" class="form-control" placeholder="Your name" required minlength="2" maxlength="100" value="' + escapeHtml(user.name || "") + '" /></div>' +
          '<div class="form-group"><label for="profileDesignation">Designation</label><input type="text" id="profileDesignation" class="form-control" placeholder="e.g. HR Manager, Recruiter" maxlength="100" value="' + escapeHtml(designation) + '" /></div>' +
          '<div class="form-group"><label for="profileCompany">Company</label><input type="text" id="profileCompany" class="form-control" placeholder="Company name" maxlength="200" value="' + escapeHtml(company) + '" /></div>' +
          '<div id="profileError" class="alert alert-danger d-none mb-2"></div>' +
          '<div id="profileSuccess" class="alert alert-success d-none mb-2"></div>' +
          '<button type="submit" class="btn btn-primary">Save profile</button>' +
          "</form></div></div>";
      } else {
        var skills = (user.skills != null) ? String(user.skills) : "";
        var location = (user.location != null) ? String(user.location) : "";
        html =
          '<div class="card"><div class="card-body">' +
          '<form id="profileForm">' +
          '<div class="form-group"><label for="profileName">Name</label><input type="text" id="profileName" class="form-control" placeholder="Your name" required minlength="2" maxlength="100" value="' + escapeHtml(user.name || "") + '" /></div>' +
          '<div class="form-group"><label for="profileSkills">Skills</label><input type="text" id="profileSkills" class="form-control" placeholder="e.g. JavaScript, Python, Project Management" maxlength="500" value="' + escapeHtml(skills) + '" /></div>' +
          '<div class="form-group"><label for="profileLocation">Location</label><input type="text" id="profileLocation" class="form-control" placeholder="e.g. New York, Remote" maxlength="255" value="' + escapeHtml(location) + '" /></div>' +
          '<div id="profileError" class="alert alert-danger d-none mb-2"></div>' +
          '<div id="profileSuccess" class="alert alert-success d-none mb-2"></div>' +
          '<button type="submit" class="btn btn-primary">Save profile</button>' +
          "</form></div></div>";
      }

      el.innerHTML = html;

      document.getElementById("profileForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var errEl = document.getElementById("profileError");
        var okEl = document.getElementById("profileSuccess");
        errEl.classList.add("d-none");
        okEl.classList.add("d-none");
        var name = document.getElementById("profileName").value.trim();
        if (!name || name.length < 2) {
          errEl.textContent = "Name must be at least 2 characters.";
          errEl.classList.remove("d-none");
          return;
        }
        var payload = { name: name };
        if (role === "admin") {
          payload.about = document.getElementById("profileAbout").value.trim() || null;
        } else if (role === "employer") {
          payload.designation = document.getElementById("profileDesignation").value.trim() || null;
          payload.company = document.getElementById("profileCompany").value.trim() || null;
        } else {
          payload.skills = document.getElementById("profileSkills").value.trim() || null;
          payload.location = document.getElementById("profileLocation").value.trim() || null;
        }
        apiRequest("/users/me", "PUT", payload, true)
          .then(function (updated) {
            okEl.textContent = "Profile updated successfully.";
            okEl.classList.remove("d-none");
            if (currentUser) {
              currentUser.name = updated.name;
              if (role === "admin") {
                currentUser.about = updated.about;
              } else if (role === "employer") {
                currentUser.designation = updated.designation;
                currentUser.company = updated.company;
              } else {
                currentUser.skills = updated.skills;
                currentUser.location = updated.location;
              }
            }
          })
          .catch(function (err) {
            errEl.textContent = err.message || "Failed to update profile.";
            errEl.classList.remove("d-none");
          });
      });
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}

function loadSettings() {
  var el = getMainContainer();
  if (!el) return;
  el.innerHTML = '<div class="text-muted"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

  apiRequest("/users/me", "GET", null, true)
    .then(function (user) {
      var html =
        '<div class="card"><div class="card-header"><h6 class="mb-0">Change email &amp; password</h6></div><div class="card-body">' +
        '<form id="settingsForm">' +
        '<div class="form-group"><label for="settingsEmail">Email</label><input type="email" id="settingsEmail" class="form-control" placeholder="your@email.com" required value="' + escapeHtml(user.email || "") + '" />' +
        '<div id="settingsEmailStatus" class="small mt-1"></div></div>' +
        '<div class="form-group"><label for="settingsNewPassword">New password</label><input type="password" id="settingsNewPassword" class="form-control" placeholder="Leave blank to keep current" minlength="6" maxlength="72" autocomplete="new-password" /></div>' +
        '<div class="form-group"><label for="settingsConfirmPassword">Confirm new password</label><input type="password" id="settingsConfirmPassword" class="form-control" placeholder="Repeat new password" minlength="6" maxlength="72" autocomplete="new-password" /></div>' +
        '<div class="form-group"><label for="settingsCurrentPassword">Current password</label><input type="password" id="settingsCurrentPassword" class="form-control" placeholder="Enter current password to confirm changes" autocomplete="current-password" /></div>' +
        '<div id="settingsError" class="alert alert-danger d-none mb-2"></div>' +
        '<div id="settingsSuccess" class="alert alert-success d-none mb-2"></div>' +
        '<button type="submit" class="btn btn-primary">Update</button>' +
        "</form></div></div>";

      el.innerHTML = html;

      var currentEmail = (user.email || "").trim().toLowerCase();
      var emailCheckTimeout = null;

      function showEmailStatus(msg, isAvailable) {
        var statusEl = document.getElementById("settingsEmailStatus");
        if (!statusEl) return;
        statusEl.textContent = msg;
        statusEl.className = "small mt-1 " + (isAvailable === true ? "text-success" : isAvailable === false ? "text-danger" : "text-muted");
      }

      document.getElementById("settingsEmail").addEventListener("blur", function () {
        var emailVal = this.value.trim();
        if (!emailVal) {
          showEmailStatus("", null);
          return;
        }
        if (emailVal.toLowerCase() === currentEmail) {
          showEmailStatus("", null);
          return;
        }
        if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
        showEmailStatus("Checking…", null);
        apiRequest("/users/check-email?email=" + encodeURIComponent(emailVal), "GET", null, true)
          .then(function (res) {
            if (res && res.available) showEmailStatus("Available", true);
            else showEmailStatus("User Already Exists", false);
          })
          .catch(function () {
            showEmailStatus("", null);
          });
      });

      document.getElementById("settingsEmail").addEventListener("input", function () {
        var emailVal = this.value.trim();
        if (!emailVal) {
          showEmailStatus("", null);
          return;
        }
        if (emailVal.toLowerCase() === currentEmail) {
          showEmailStatus("", null);
          return;
        }
        if (emailCheckTimeout) clearTimeout(emailCheckTimeout);
        emailCheckTimeout = setTimeout(function () {
          showEmailStatus("Checking…", null);
          apiRequest("/users/check-email?email=" + encodeURIComponent(emailVal), "GET", null, true)
            .then(function (res) {
              var statusEl = document.getElementById("settingsEmailStatus");
              if (!statusEl) return;
              var currentVal = document.getElementById("settingsEmail") && document.getElementById("settingsEmail").value.trim();
              if (currentVal !== emailVal) return;
              if (res && res.available) showEmailStatus("Available", true);
              else showEmailStatus("User Already Exists", false);
            })
            .catch(function () {
              showEmailStatus("", null);
            });
        }, 400);
      });

      document.getElementById("settingsForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var errEl = document.getElementById("settingsError");
        var okEl = document.getElementById("settingsSuccess");
        errEl.classList.add("d-none");
        okEl.classList.add("d-none");
        var currentPassword = document.getElementById("settingsCurrentPassword").value;
        var email = document.getElementById("settingsEmail").value.trim();
        var newPassword = document.getElementById("settingsNewPassword").value;
        var confirmPassword = document.getElementById("settingsConfirmPassword").value;
        if (!email) {
          errEl.textContent = "Email is required.";
          errEl.classList.remove("d-none");
          return;
        }
        if (!currentPassword || !currentPassword.trim()) {
          errEl.textContent = "Current password is required to change email or password.";
          errEl.classList.remove("d-none");
          return;
        }
        if (newPassword.length > 0 && newPassword !== confirmPassword) {
          errEl.textContent = "New password and confirm password do not match.";
          errEl.classList.remove("d-none");
          return;
        }
        if (newPassword.length > 0 && newPassword.length < 6) {
          errEl.textContent = "Password must be at least 6 characters.";
          errEl.classList.remove("d-none");
          return;
        }
        var payload = { email: email, current_password: currentPassword };
        if (newPassword.length > 0) payload.password = newPassword;
        apiRequest("/users/me", "PUT", payload, true)
          .then(function (updated) {
            okEl.textContent = "Details updated successfully.";
            okEl.classList.remove("d-none");
            if (currentUser) currentUser.email = updated.email;
            document.getElementById("settingsCurrentPassword").value = "";
            document.getElementById("settingsConfirmPassword").value = "";
            document.getElementById("settingsNewPassword").value = "";
          })
          .catch(function (err) {
            errEl.textContent = err.message || "Failed to update settings.";
            errEl.classList.remove("d-none");
          });
      });
    })
    .catch(function (err) {
      el.innerHTML = '<div class="alert alert-danger">' + escapeHtml(err.message) + "</div>";
    });
}
