var landingJobs = [];

document.addEventListener("DOMContentLoaded", function () {
  loadLandingJobs();
  setupSearch();
});

function setupSearch() {
  var input = document.getElementById("homeSearch");
  var section = document.getElementById("searchResultsSection");
  var cardsContainer = document.getElementById("searchResultsCards");
  if (!input || !section || !cardsContainer) return;

  function onSearchChange() {
    var q = (input.value || "").trim();
    if (q === "") {
      section.style.display = "none";
      cardsContainer.innerHTML = "";
      return;
    }
    var filtered = filterJobsByQuery(landingJobs, q);
    section.style.display = "block";
    renderJobCardsInto(cardsContainer, filtered, "search");
  }

  input.addEventListener("input", onSearchChange);
  input.addEventListener("keyup", function (e) {
    if (e.key === "Escape") {
      input.value = "";
      onSearchChange();
      input.blur();
    }
  });
}

function filterJobsByQuery(jobs, query) {
  if (!query) return [];
  var lower = query.toLowerCase();
  return jobs.filter(function (job) {
    var title = (job.title || "").toLowerCase();
    var location = (job.location || "").toLowerCase();
    var desc = (job.description || "").toLowerCase();
    return title.indexOf(lower) !== -1 || location.indexOf(lower) !== -1 || desc.indexOf(lower) !== -1;
  });
}

function renderJobCard(job) {
  var desc = (job.description || "").substring(0, 140);
  if ((job.description || "").length > 140) desc += "...";
  var title = (job.title || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var location = (job.location || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  var descEscaped = desc.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return (
    '<div class="col-md-6 col-lg-4">' +
    '<div class="home-job-card">' +
    '<div class="job-card-accent"></div>' +
    '<div class="job-card-inner">' +
    '<h3 class="job-card-title">' + title + "</h3>" +
    '<p class="job-card-meta"><i class="fas fa-map-marker-alt"></i> ' + location + "</p>" +
    '<p class="job-card-desc">' + descEscaped + "</p>" +
    '<button type="button" class="job-card-apply" onclick="landingApply(' + job.id + ')">Apply</button>' +
    "</div></div></div>"
  );
}

function renderJobCardsInto(container, jobs, context) {
  if (!container) return;
  if (!jobs.length) {
    container.innerHTML = '<div class="col-12"><div class="home-job-card"><div class="job-card-accent"></div><div class="job-card-inner" style="text-align: center; color: #666;">No jobs match your search.</div></div></div>';
    return;
  }
  container.innerHTML = jobs.map(renderJobCard).join("");
}

function loadLandingJobs() {
  var container = document.getElementById("homeCards");
  if (!container) return;

  apiRequest("/jobs", "GET", null, false)
    .then(function (jobs) {
      landingJobs = jobs || [];
      renderLandingJobs(landingJobs);
    })
    .catch(function (err) {
      var msg = (err.message || "Please try again later.").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      container.innerHTML = '<div class="col-12"><div class="home-job-card"><div class="job-card-accent"></div><div class="job-card-inner" style="text-align: center;"><strong>Couldn\'t load jobs</strong><p class="job-card-desc mt-2 mb-0">' + msg + "</p></div></div></div>";
    });
}

function renderLandingJobs(jobs) {
  var container = document.getElementById("homeCards");
  if (!container) return;

  if (!jobs.length) {
    container.innerHTML = '<div class="col-12"><div class="home-job-card"><div class="job-card-accent"></div><div class="job-card-inner" style="text-align: center; color: #666;">No jobs found. Check back later.</div></div></div>';
    return;
  }

  container.innerHTML = jobs.map(renderJobCard).join("");
}

function landingApply(jobId) {
  if (!window.localStorage || !window.localStorage.getItem("access_token")) {
    window.location.href = "login.html";
    return;
  }
  window.location.href = "dashboard.html";
}
