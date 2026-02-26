/**
 * Shared layout: header, footer, logout.
 * For dashboard, sidebar is built by dashboard.js.
 * On public pages (body.layout-public) the pushmenu is hidden (no sidebar).
 */
function getCurrentPage() {
  var path = (window.location.pathname || "").toLowerCase();
  var href = (window.location.href || "").toLowerCase();
  var pathOrHref = path + " " + href;

  if (pathOrHref.indexOf("privacy") !== -1) return "privacy";
  if (pathOrHref.indexOf("register") !== -1) return "register";
  if (pathOrHref.indexOf("login") !== -1) return "login";
  if (pathOrHref.indexOf("dashboard") !== -1) return "dashboard";
  return "index";
}

function renderHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  var current = getCurrentPage();
  var activeClass = " nav-link-active";

  const token = window.localStorage && window.localStorage.getItem("access_token");
  var loginClass = current === "login" ? activeClass : "";
  var registerClass = current === "register" ? activeClass : "";
  var dashboardClass = current === "dashboard" ? activeClass : "";
  var indexClass = current === "index" ? activeClass : "";

  const navLinks = token
    ? '<li class="nav-item"><a class="nav-link' + dashboardClass + '" href="dashboard.html">Dashboard</a></li>' +
      '<li class="nav-item"><a class="nav-link" href="#" onclick="logoutFront(); return false;">Logout</a></li>'
    : '<li class="nav-item"><a class="nav-link' + loginClass + '" href="login.html">Login</a></li>' +
      '<li class="nav-item"><a class="nav-link' + registerClass + '" href="register.html">Register</a></li>';

  const isPublic = document.body.classList.contains("layout-public");
  const pushMenu = isPublic
    ? ''
    : '<li class="nav-item"><a class="nav-link" data-widget="pushmenu" href="#" role="button"><i class="fas fa-bars"></i></a></li>';

  /* When logged in, portal link goes to dashboard; when not, to index */
  var portalLabel = '<span id="headerPortalName">Job Portal</span>';
  var portalHref = token ? "dashboard.html" : "index.html";
  var portalLinkExtra = token ? ' id="headerPortalLink"' : "";

  header.innerHTML =
    '<nav class="main-header navbar navbar-expand navbar-white navbar-light">' +
    '<ul class="navbar-nav">' +
    pushMenu +
    '<li class="nav-item"><a class="nav-link' + indexClass + '" href="' + portalHref + '"' + portalLinkExtra + '>' + portalLabel + '</a></li>' +
    '</ul>' +
    '<ul class="navbar-nav ml-auto">' + navLinks + '</ul>' +
    '</nav>';
}

function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;
  footer.innerHTML =
    '<footer class="main-footer">' +
    '<strong>Job Management System</strong>' +
    ' <span class="ml-2">|</span> <a href="privacy.html" class="ml-2">Privacy Policy</a>' +
    '</footer>';
}

function logoutFront() {
  try {
    window.localStorage && window.localStorage.removeItem("access_token");
  } catch (_) {}
  window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  renderFooter();
});
