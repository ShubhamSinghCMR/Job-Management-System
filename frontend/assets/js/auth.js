document.addEventListener("DOMContentLoaded", function () {
  var loginForm = document.getElementById("loginForm");
  var registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", onLoginSubmit);
  }
  if (registerForm) {
    registerForm.addEventListener("submit", onRegisterSubmit);
    setupRegisterValidation();
  }
});

function setupRegisterValidation() {
  var form = document.getElementById("registerForm");
  if (!form) return;

  ["name", "regEmail", "regPassword"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", clearRegisterFieldError.bind(null, id));
    el.addEventListener("change", clearRegisterFieldError.bind(null, id));
    el.addEventListener("blur", function () { validateRegisterField(id); });
  });

  var roleRadios = form.querySelectorAll('input[name="role"]');
  roleRadios.forEach(function (radio) {
    radio.addEventListener("change", function () { clearRegisterFieldError("role"); });
  });
  var consentCheck = document.getElementById("privacyConsent");
  if (consentCheck) {
    consentCheck.addEventListener("change", function () { clearRegisterFieldError("consent"); });
  }
}

function clearRegisterFieldError(fieldId) {
  var el = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + "Error");
  if (fieldId === "role") {
    var group = document.getElementById("roleGroup");
    if (group) group.classList.remove("is-invalid");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  } else if (fieldId === "consent") {
    var group = document.getElementById("consentGroup");
    if (group) group.classList.remove("is-invalid");
    errorEl = document.getElementById("consentError");
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  } else {
    if (el) {
      el.classList.remove("is-invalid", "is-valid");
    }
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("show");
    }
  }
  hideError(document.getElementById("registerError"));
}

function validateRegisterField(fieldId) {
  var value;
  var msg = "";
  var el = document.getElementById(fieldId);
  var errorEl = document.getElementById(fieldId + "Error");
  if (fieldId === "role") {
    var group = document.getElementById("roleGroup");
    var checked = document.querySelector('input[name="role"]:checked');
    value = checked ? checked.value : "";
    errorEl = document.getElementById("roleError");
    if (!group || !errorEl) return true;

    if (!value || (value !== "employer" && value !== "jobseeker")) {
      msg = "Please select a role.";
    }

    if (msg) {
      group.classList.add("is-invalid");
      errorEl.textContent = msg;
      errorEl.classList.add("show");
      return false;
    }
    group.classList.remove("is-invalid");
    errorEl.textContent = "";
    errorEl.classList.remove("show");
    return true;
  }

  if (fieldId === "consent") {
    var consentGroup = document.getElementById("consentGroup");
    errorEl = document.getElementById("consentError");
    var consentCheck = document.getElementById("privacyConsent");
    if (!consentGroup || !errorEl || !consentCheck) return true;
    if (!consentCheck.checked) {
      consentGroup.classList.add("is-invalid");
      errorEl.textContent = "You must agree to the Privacy Policy to register.";
      errorEl.classList.add("show");
      return false;
    }
    consentGroup.classList.remove("is-invalid");
    errorEl.textContent = "";
    errorEl.classList.remove("show");
    return true;
  }

  if (!el || !errorEl) return true;

  value = el.value.trim();

  if (fieldId === "name") {
    if (value.length === 0) {
      msg = "Full name is required.";
    } else if (value.length < 2) {
      msg = "Name must be at least 2 characters.";
    } else if (value.length > 100) {
      msg = "Name must be at most 100 characters.";
    }
  } else if (fieldId === "regEmail") {
    if (value.length === 0) {
      msg = "Email is required.";
    } else if (!isValidEmail(value)) {
      msg = "Enter a valid email address.";
    } else if (value.length > 255) {
      msg = "Email is too long.";
    }
  } else if (fieldId === "regPassword") {
    if (value.length === 0) {
      msg = "Password is required.";
    } else if (value.length < 6) {
      msg = "Password must be at least 6 characters.";
    } else if (value.length > 72) {
      msg = "Password must be at most 72 characters.";
    }
  }

  if (msg) {
    el.classList.add("is-invalid");
    el.classList.remove("is-valid");
    errorEl.textContent = msg;
    errorEl.classList.add("show");
    return false;
  }
  el.classList.remove("is-invalid");
  el.classList.add("is-valid");
  errorEl.textContent = "";
  errorEl.classList.remove("show");
  return true;
}

function isValidEmail(str) {
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(str);
}

function validateRegisterForm() {
  var valid = true;
  ["name", "regEmail", "regPassword", "role", "consent"].forEach(function (id) {
    if (!validateRegisterField(id)) valid = false;
  });
  return valid;
}

function onLoginSubmit(e) {
  e.preventDefault();
  var email = document.getElementById("email").value.trim();
  var password = document.getElementById("password").value;
  var errorBox = document.getElementById("loginError");

  if (!email || !password) {
    showError(errorBox, "Please enter email and password.");
    return;
  }

  var formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  fetch(API_BASE_URL + "/auth/login", {
    method: "POST",
    body: formData,
  })
    .then(function (res) {
      if (!res.ok) throw new Error("Invalid credentials");
      return res.json();
    })
    .then(function (data) {
      window.localStorage.setItem("access_token", data.access_token);
      window.location.href = "dashboard.html";
    })
    .catch(function (err) {
      showError(errorBox, err.message || "Login failed");
    });
}

function onRegisterSubmit(e) {
  e.preventDefault();
  var errorBox = document.getElementById("registerError");
  hideError(errorBox);

  if (!validateRegisterForm()) {
    var firstInvalid = document.querySelector("#registerForm .form-control.is-invalid");
    var roleGroupInvalid = document.getElementById("roleGroup") && document.getElementById("roleGroup").classList.contains("is-invalid");
    var consentGroupInvalid = document.getElementById("consentGroup") && document.getElementById("consentGroup").classList.contains("is-invalid");
    if (firstInvalid) {
      firstInvalid.focus();
    } else if (roleGroupInvalid) {
      var firstRadio = document.querySelector('input[name="role"]');
      if (firstRadio) firstRadio.focus();
    } else if (consentGroupInvalid) {
      var consentCheck = document.getElementById("privacyConsent");
      if (consentCheck) consentCheck.focus();
    }
    return;
  }

  var name = document.getElementById("name").value.trim();
  var email = document.getElementById("regEmail").value.trim();
  var password = document.getElementById("regPassword").value;
  var checkedRole = document.querySelector('input[name="role"]:checked');
  var role = checkedRole ? checkedRole.value : "";

  apiRequest("/auth/register", "POST", { name: name, email: email, password: password, role: role }, false)
    .then(function () {
      showRegisterSuccessToast();
    })
    .catch(function (err) {
      showError(errorBox, err.message || "Registration failed");
    });
}

function showRegisterSuccessToast() {
  var toast = document.createElement("div");
  toast.id = "registerSuccessToast";
  toast.className = "register-toast register-toast-show";
  toast.setAttribute("role", "alert");
  toast.innerHTML = '<span class="register-toast-icon"><i class="fas fa-check-circle"></i></span><span class="register-toast-text">Registration successful! Redirecting in <span id="registerToastCount">3</span>…</span>';

  document.body.appendChild(toast);

  var countEl = document.getElementById("registerToastCount");
  var count = 3;
  var interval = setInterval(function () {
    count--;
    if (countEl) countEl.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      window.location.href = "login.html";
    }
  }, 1000);
}

function showError(box, msg) {
  if (!box) return;
  box.textContent = msg;
  box.classList.remove("d-none");
}

function hideError(box) {
  if (!box) return;
  box.classList.add("d-none");
  box.textContent = "";
}
