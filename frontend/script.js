const API_URL = "https://portfolio-backend-au16.onrender.com/api/portfolios";

const form = document.getElementById("portfolioForm");

const addProjectBtn = document.getElementById("addProjectBtn");
const projectsContainer = document.getElementById("projectsContainer");

const addCertBtn = document.getElementById("addCertBtn");
const certificationsContainer = document.getElementById("certificationsContainer");

const addExperienceBtn = document.getElementById("addExperienceBtn") || document.getElementById("addExpBtn");
const experienceContainer = document.getElementById("experienceContainer");

const params = new URLSearchParams(window.location.search);
let currentSlug = params.get("id");

if (!currentSlug && window.location.pathname.startsWith("/p/")) {
  currentSlug = window.location.pathname.replace("/p/", "");
}

/* ADD PROJECT */
if (addProjectBtn && projectsContainer) {
  addProjectBtn.addEventListener("click", function () {
    addProjectInput();
  });
}

function addProjectInput(project = {}) {
  const div = document.createElement("div");
  div.className = "project-input";
  div.innerHTML = `
    <div class="form-group"><label>Project Title</label><input type="text" class="projectTitle" placeholder="Portfolio Builder App" value="${project.title || ""}"></div>
    <div class="form-group"><label>Description</label><textarea class="projectDescription" placeholder="A full-stack web app..." rows="3">${project.description || ""}</textarea></div>
    <div class="form-row">
      <div style="flex:1"><div class="form-group"><label>Technologies</label><input type="text" class="projectTech" placeholder="React, Firebase..." value="${project.tech ? project.tech.join(",") : ""}"></div></div>
      <div style="flex:1"><div class="form-group"><label>Project Link</label><input type="text" class="projectLink" placeholder="github.com/..." value="${project.link || ""}"></div></div>
    </div>
  `;
  projectsContainer.appendChild(div);
}

/* ADD CERTIFICATE */
if (addCertBtn && certificationsContainer) {
  addCertBtn.addEventListener("click", function () {
    addCertInput();
  });
}

function addCertInput(cert = {}) {
  const div = document.createElement("div");
  div.className = "cert-input";
  div.innerHTML = `
    <div class="form-row">
      <div style="flex:2"><div class="form-group"><label>Certificate Title</label><input type="text" class="certTitle" placeholder="AWS Solutions Architect" value="${cert.title || ""}"></div></div>
      <div style="flex:1"><div class="form-group"><label>Provider</label><input type="text" class="certProvider" placeholder="Amazon" value="${cert.provider || ""}"></div></div>
      <div style="flex:0 0 80px"><div class="form-group"><label>Year</label><input type="text" class="certYear" placeholder="2024" value="${cert.year || ""}"></div></div>
    </div>
    <div class="form-group" style="margin-bottom:0">
      <label>Upload Certificate (Image / PDF)</label>
      <div class="file-zone" style="padding:12px;margin-bottom:0;position:relative">
        <input type="file" class="certFile" accept="image/*,.pdf" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%">
        <p class="certFileText">📜 Drop certificate or <span>browse</span></p>
      </div>
    </div>
  `;
  certificationsContainer.appendChild(div);
}

/* ADD EXPERIENCE */
if (addExperienceBtn && experienceContainer) {
  addExperienceBtn.addEventListener("click", function () {
    addExperienceInput();
  });
}

function addExperienceInput(exp = {}) {
  const div = document.createElement("div");
  div.className = "experience-input";
  div.innerHTML = `
    <div class="form-row">
      <div style="flex:1"><div class="form-group"><label>Title / Company</label><input type="text" class="expTitle" placeholder="Frontend Developer @ Acme" value="${exp.title || ""}"></div></div>
      <div style="flex:0 0 140px"><div class="form-group"><label>Year / Duration</label><input type="text" class="expYear" placeholder="2022 – 2024" value="${exp.year || ""}"></div></div>
    </div>
    <div class="form-group"><label>Description</label><textarea class="expDescription" placeholder="Led development of..." rows="3">${exp.description || ""}</textarea></div>
  `;
  experienceContainer.appendChild(div);
}

/* BUILDER SUBMIT */
if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const getValue = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };

    const readFileAsBase64 = (file) => new Promise((resolve) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });

    const projectBlocks = document.querySelectorAll(".project-input");
    const projects = Array.from(projectBlocks)
      .filter(block => block.querySelector(".projectTitle"))
      .map(block => ({
        title: block.querySelector(".projectTitle").value,
        description: block.querySelector(".projectDescription").value,
        tech: block.querySelector(".projectTech").value.split(","),
        link: block.querySelector(".projectLink").value
      }));

    // Read cert files as base64 async
    const certBlocks = Array.from(document.querySelectorAll(".cert-input"))
      .filter(block => block.querySelector(".certTitle"));
    const certifications = await Promise.all(certBlocks.map(async block => {
      const fileInput = block.querySelector(".certFile");
      const fileData = fileInput && fileInput.files[0]
        ? await readFileAsBase64(fileInput.files[0]) : "";
      return {
        title: block.querySelector(".certTitle").value,
        provider: block.querySelector(".certProvider") ? block.querySelector(".certProvider").value : "",
        year: block.querySelector(".certYear") ? block.querySelector(".certYear").value : "",
        fileData
      };
    }));

    const expBlocks = document.querySelectorAll(".experience-input");
    const experiences = Array.from(expBlocks)
      .filter(block => block.querySelector(".expTitle"))
      .map(block => ({
        title: block.querySelector(".expTitle").value,
        year: block.querySelector(".expYear") ? block.querySelector(".expYear").value : "",
        description: block.querySelector(".expDescription").value
      }));

    const data = {
      name: getValue("name"),
      role: getValue("role"),
      template: getValue("template") || "developer",
      about: getValue("about"),
      skills: getValue("skills").split(","),
      github: getValue("github"),
      linkedin: getValue("linkedin"),
      email: getValue("email"),
      phone: getValue("phone"),
      projects,
      certifications,
      experiences,
      image: "",
      resume: ""
    };

    const fileInput = document.getElementById("profileImage");
    const file = fileInput ? fileInput.files[0] : null;

    const resumeInput = document.getElementById("resumeFile");
    const resumeFile = resumeInput ? resumeInput.files[0] : null;

    const saveAndRedirect = () => {
      localStorage.setItem("portfolioData", JSON.stringify(data));
      window.location.href = "./preview.html";
    };

    function readResumeAndSave() {
      if (resumeFile) {
        if (resumeFile.type !== "application/pdf") {
          alert("Resume must be a PDF file");
          return;
        }
        if (resumeFile.size > 2 * 1024 * 1024) {
          alert("Resume size must be below 2MB");
          return;
        }
        const resumeReader = new FileReader();
        resumeReader.onloadend = function () {
          data.resume = resumeReader.result;
          saveAndRedirect();
        };
        resumeReader.onerror = function () {
          alert("Error reading resume");
        };
        resumeReader.readAsDataURL(resumeFile);
      } else {
        saveAndRedirect();
      }
    }

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be below 2MB");
        return;
      }
      // Compress image before saving
      const reader = new FileReader();
      reader.onloadend = function () {
        const img = new Image();
        img.onload = function() {
          const canvas = document.createElement('canvas');
          const maxSize = 400;
          let w = img.width, h = img.height;
          if (w > h && w > maxSize) { h = h * maxSize / w; w = maxSize; }
          else if (h > maxSize) { w = w * maxSize / h; h = maxSize; }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d').drawImage(img, 0, 0, w, h);
          data.image = canvas.toDataURL('image/jpeg', 0.7);
          readResumeAndSave();
        };
        img.src = reader.result;
      };
      reader.onerror = function () { alert("Error reading image"); };
      reader.readAsDataURL(file);
    } else {
      readResumeAndSave();
    }
  });
}

/* LOAD PORTFOLIO */
let data = null;

async function loadPortfolio() {
  const page = window.location.pathname;

  try {
    if (currentSlug && page.includes("builder.html")) {
      const response = await fetch(API_URL + "/" + currentSlug);
      const portfolio = await response.json();
      fillBuilderForm(portfolio);
      return;
    }

    if (currentSlug) {
      const response = await fetch(API_URL + "/" + currentSlug);
      data = await response.json();

      if (window.location.pathname.startsWith("/p/")) {
        const viewResponse = await fetch(API_URL + "/" + currentSlug + "/view", {
          method: "PUT"
        });
        data = await viewResponse.json();
      }

      data.skills = data.skills ? data.skills.split(",") : [];
      data.projects = data.projects ? JSON.parse(data.projects) : [];
      data.certifications = data.certifications ? JSON.parse(data.certifications) : [];
      data.experiences = data.experiences ? JSON.parse(data.experiences) : [];

      renderPortfolio();
      updateOwnerButtons(); // ← called AFTER data is loaded
      return;
    }

    if (page.includes("preview.html")) {
      data = JSON.parse(localStorage.getItem("portfolioData"));

      if (!data) {
        alert("No preview data found. Please create portfolio again.");
        window.location.href = "builder.html";
        return;
      }

      data.skills = Array.isArray(data.skills) ? data.skills : [];
      data.projects = Array.isArray(data.projects) ? data.projects : [];
      data.certifications = Array.isArray(data.certifications) ? data.certifications : [];
      data.experiences = Array.isArray(data.experiences) ? data.experiences : [];

      renderPortfolio();
      updateOwnerButtons(); // ← called AFTER data is loaded
    }
  } catch (error) {
    console.error(error);
  }
}

loadPortfolio();

/* OWNER BUTTONS — called after data loads */
function updateOwnerButtons() {
  const ownerButtons = document.querySelectorAll(".owner-only");
  const loggedInEmail = localStorage.getItem("userEmail");

  if (loggedInEmail && data && loggedInEmail === data.email) {
    ownerButtons.forEach(btn => {
      btn.style.display = "inline-flex";
    });
  } else {
    ownerButtons.forEach(btn => {
      btn.style.display = "none";
    });
  }
}

/* FILL BUILDER FORM */
function fillBuilderForm(data) {
  document.getElementById("name").value = data.name || "";
  document.getElementById("role").value = data.role || "";

  const templateInput = document.getElementById("template");
  if (templateInput) templateInput.value = data.template || "developer";

  document.getElementById("about").value = data.about || "";
  document.getElementById("skills").value = data.skills || "";
  document.getElementById("github").value = data.github || "";
  document.getElementById("linkedin").value = data.linkedin || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("phone").value = data.phone || "";

  if (data.projects && projectsContainer) {
    projectsContainer.innerHTML = "";
    JSON.parse(data.projects).forEach(project => addProjectInput(project));
  }

  if (data.certifications && certificationsContainer) {
    certificationsContainer.innerHTML = "";
    JSON.parse(data.certifications).forEach(cert => addCertInput(cert));
  }

  if (data.experiences && experienceContainer) {
    experienceContainer.innerHTML = "";
    JSON.parse(data.experiences).forEach(exp => addExperienceInput(exp));
  }
}

/* RENDER PORTFOLIO */
function renderPortfolio() {
  if (!data) return;

  const previewCard = document.querySelector(".preview-card");

  if (previewCard) {
    previewCard.classList.remove("developer-template", "data-template", "minimal-template");
    previewCard.classList.add((data.template || "developer") + "-template");
  }

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "";
  };

  const setHref = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) {
      el.href = value;
      el.style.display = "inline";
    } else if (el) {
      el.style.display = "none";
    }
  };

  const previewImage = document.getElementById("previewImage");
  if (previewImage && data.image) previewImage.src = data.image;

  setText("previewName", data.name);
  setText("previewRole", data.role);
  setText("previewAbout", data.about);

  const portfolioViews = document.getElementById("portfolioViews");
  if (portfolioViews) portfolioViews.innerText = "👁️ Views: " + (data.views || 0);

  setText("previewEmail", data.email);
  setHref("previewEmail", "mailto:" + data.email);
  setHref("previewGithub", data.github);
  setHref("previewLinkedin", data.linkedin);

  const resumeLink = document.getElementById("previewResume");
  if (resumeLink) {
    if (data.resume) {
      resumeLink.href = data.resume;
      resumeLink.download = "resume.pdf";
      resumeLink.innerText = "Download Resume";
      resumeLink.style.display = "inline";
    } else {
      resumeLink.innerText = "No Resume Uploaded";
      resumeLink.removeAttribute("href");
      resumeLink.style.display = "inline";
    }
  }

  setText("previewPhone", "📱 " + data.phone);

  const skillsContainer = document.getElementById("previewSkills");
  if (skillsContainer && data.skills) {
    skillsContainer.innerHTML = "";
    data.skills.forEach(skill => {
      if (skill.trim()) {
        const span = document.createElement("span");
        span.innerText = skill.trim();
        skillsContainer.appendChild(span);
      }
    });
  }

  const previewProjects = document.getElementById("previewProjects");
  if (previewProjects && data.projects) {
    previewProjects.innerHTML = "";
    data.projects.forEach(project => {
      if (!project.title.trim() && !project.description.trim()) return;
      const card = document.createElement("div");
      card.className = "project-preview";
      const techHtml = project.tech.filter(t => t.trim()).map(t => `<span>${t.trim()}</span>`).join("");
      card.innerHTML = `
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="skills-list">${techHtml}</div>
        <a href="${project.link || "#"}" target="_blank">View Project</a>
      `;
      previewProjects.appendChild(card);
    });
  }

  const previewCertifications = document.getElementById("previewCertifications");
  if (previewCertifications && data.certifications) {
    previewCertifications.innerHTML = "";
    data.certifications.forEach(cert => {
      if (!cert.title.trim()) return;
      const card = document.createElement("div");
      card.className = "cert-card";
      const viewBtn = cert.fileData
        ? `<a href="${cert.fileData}" target="_blank" class="cert-view-btn">📜 View Certificate</a>`
        : "";
      card.innerHTML = `
        <h3>${cert.title}</h3>
        <p>${cert.provider || ""}</p>
        <p>${cert.year || ""}</p>
        ${viewBtn}
      `;
      previewCertifications.appendChild(card);
    });
  }

  const previewExperience = document.getElementById("previewExperience");
  if (previewExperience && data.experiences) {
    previewExperience.innerHTML = "";
    data.experiences.forEach(exp => {
      if (!exp.title.trim() && !exp.description.trim()) return;
      const card = document.createElement("div");
      card.className = "experience-card";
      card.innerHTML = `<h3>${exp.title}</h3><span>${exp.year}</span><p>${exp.description}</p>`;
      previewExperience.appendChild(card);
    });
  }
}

/* PUBLISH PORTFOLIO */
const publishBtn = document.getElementById("publishBtn");

if (publishBtn) {
  publishBtn.addEventListener("click", async function () {
    const data = JSON.parse(localStorage.getItem("portfolioData"));

    if (!data || !data.name) {
      alert("No portfolio data found");
      return;
    }

    const slug = data.name.toLowerCase().trim().replaceAll(" ", "-");
    const userEmail = localStorage.getItem("userEmail");

    // Strip fileData from certs before sending to backend (keeps payload small)
    const certsForBackend = (Array.isArray(data.certifications) ? data.certifications : [])
      .map(({ fileData, ...rest }) => rest);

    const payload = {
      name: data.name,
      role: data.role,
      template: data.template || "developer",
      about: data.about,
      skills: Array.isArray(data.skills) ? data.skills.join(",") : data.skills,
      github: data.github,
      linkedin: data.linkedin,
      email: data.email,
      phone: data.phone,
      image: data.image || "",
      resume: data.resume || "",
      slug: slug,
      projects: JSON.stringify(Array.isArray(data.projects) ? data.projects : []),
      certifications: JSON.stringify(certsForBackend),
      experiences: JSON.stringify(Array.isArray(data.experiences) ? data.experiences : []),
      userEmail: userEmail
    };

    try {
      // Try to update first (PUT), if not found create (POST)
      let response = await fetch(API_URL + "/" + slug, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      // If PUT fails or not found, create new with POST
      if (!response.ok) {
        response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error("Publish error:", response.status, errText);
        if (response.status === 500) {
          throw new Error("Server error — please logout and login again, then try publishing.");
        }
        throw new Error("Failed to publish portfolio: " + response.status);
      }

      const savedPortfolio = await response.json();

      // Save slug to localStorage for future edits
      localStorage.setItem("publishedSlug", savedPortfolio.slug || slug);

      alert("Portfolio Published Successfully 🚀");

      if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
        window.location.href = "public.html?id=" + (savedPortfolio.slug || slug);
      } else {
        window.location.href = "/p/" + (savedPortfolio.slug || slug);
      }

    } catch (error) {
      console.error(error);
      alert("Error publishing portfolio");
    }
  });
}

/* EDIT BUTTON */
const editBtn = document.getElementById("editBtn");
if (editBtn) {
  editBtn.addEventListener("click", function () {
    if (!currentSlug) { alert("Portfolio ID not found"); return; }
    window.location.href = "/builder.html?id=" + currentSlug;
  });
}

/* COPY LINK */
const copyLinkBtn = document.getElementById("copyLinkBtn");
if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", function () {
    const portfolioLink = window.location.origin + "/p/" + currentSlug;
    navigator.clipboard.writeText(portfolioLink);
    copyLinkBtn.innerText = "Link Copied ✅";
    setTimeout(function () { copyLinkBtn.innerText = "Copy Portfolio Link"; }, 2000);
  });
}

/* DELETE PORTFOLIO */
const deleteBtn = document.getElementById("deleteBtn");
if (deleteBtn) {
  deleteBtn.addEventListener("click", async function () {
    if (!currentSlug) { alert("Portfolio ID not found"); return; }
    if (!confirm("Delete this portfolio?")) return;
    try {
      const response = await fetch(API_URL + "/" + currentSlug, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
      alert("Portfolio Deleted Successfully");
      window.location.href = "/dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Error deleting portfolio");
    }
  });
}

/* THREE JS BACKGROUND */
let threeRenderer = null;
let threeAnimationId = null;

function startThreeBackground(template = "developer") {
  const canvas = document.getElementById("bg");
  if (!canvas || typeof THREE === "undefined") return;
  if (threeAnimationId) cancelAnimationFrame(threeAnimationId);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 30;

  let object;
  if (template === "data") {
    const group = new THREE.Group();
    for (let i = 0; i < 18; i++) {
      const height = Math.random() * 12 + 4;
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, height, 1.2),
        new THREE.MeshStandardMaterial({ color: 0x22c55e, wireframe: true })
      );
      bar.position.x = (i - 9) * 2;
      bar.position.y = -5;
      group.add(bar);
    }
    object = group;
  } else if (template === "minimal") {
    object = new THREE.Mesh(
      new THREE.SphereGeometry(9, 32, 32),
      new THREE.MeshStandardMaterial({ color: 0xffffff, wireframe: true, opacity: 0.25, transparent: true })
    );
  } else {
    object = new THREE.Mesh(
      new THREE.TorusKnotGeometry(10, 3, 100, 16),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, wireframe: true })
    );
  }

  scene.add(object);
  const light = new THREE.PointLight(0xffffff);
  light.position.set(20, 20, 20);
  scene.add(light, new THREE.AmbientLight(0xffffff, 0.5));

  function animate() {
    threeAnimationId = requestAnimationFrame(animate);
    object.rotation.x += 0.002;
    object.rotation.y += 0.003;
    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}

/* SIGNUP */
const signupBtn = document.getElementById("signupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;

    signupBtn.disabled = true;
    signupBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 18 18" style="animation:spin .7s linear infinite"><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"/><path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>Creating account...</span>`;
    if (!document.getElementById("spin-style")) {
      const s = document.createElement("style");
      s.id = "spin-style";
      s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }

    try {
      const response = await fetch("https://portfolio-backend-au16.onrender.com/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      if (!response.ok) throw new Error("Signup failed");
      alert("Signup Successful ✅");
      window.location.href = "login.html";
    } catch (err) {
      console.error(err);
      alert("Signup Failed ❌");
    } finally {
      signupBtn.disabled = false;
      signupBtn.innerHTML = "Signup";
    }
  });
}

/* LOGIN */
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    loginBtn.disabled = true;
    loginBtn.innerHTML = `<span style="display:inline-flex;align-items:center;gap:8px"><svg width="18" height="18" viewBox="0 0 18 18" style="animation:spin .7s linear infinite"><circle cx="9" cy="9" r="7" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2.5"/><path d="M9 2 A7 7 0 0 1 16 9" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>Signing in...</span>`;
    if (!document.getElementById("spin-style")) {
      const s = document.createElement("style");
      s.id = "spin-style";
      s.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
      document.head.appendChild(s);
    }

    try {
      const response = await fetch("https://portfolio-backend-au16.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!response.ok) throw new Error("Login failed");
      const user = await response.json();
      localStorage.setItem("token", user.email);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userRole", user.role);
      alert("Login Successful ✅");
      if (user.role === "ADMIN") {
        window.location.href = "admin.html";
      } else {
        window.location.href = "dashboard.html";
      }
    } catch (err) {
      console.error(err);
      alert("Invalid Credentials ❌");
    } finally {
      loginBtn.disabled = false;
      loginBtn.innerHTML = "Login";
    }
  });
}

/* PROTECT BUILDER PAGE */
if (window.location.pathname.includes("builder.html")) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first");
    window.location.href = "login.html";
  }
}

/* LOGOUT */
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", function () {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    alert("Logged out successfully");
    window.location.href = "login.html";
  });
}

/* DASHBOARD PORTFOLIOS */
const dashboardContainer = document.getElementById("dashboardPortfolios");
if (dashboardContainer) loadDashboardPortfolios();

/* Fix: guard all innerHTML calls */

async function loadDashboardPortfolios() {
  try {
    const userEmail = localStorage.getItem("userEmail");
    const response = await fetch(API_URL + "/my/" + userEmail);
    const portfolios = await response.json();
    const portfolioCount = document.getElementById("portfolioCount");
    if (portfolioCount) portfolioCount.innerText = "Total Portfolios: " + portfolios.length;

    dashboardContainer.innerHTML = "";
    if (!portfolios.length) {
      dashboardContainer.innerHTML = "<p>No portfolios found.</p>";
      return;
    }

    portfolios.reverse().forEach(portfolio => {
      const card = document.createElement("div");
      card.className = "dashboard-card";
      card.innerHTML = `
        <h3>${portfolio.name}</h3>
        <p>${portfolio.role || ""}</p>
        <p>👁️ Views: ${portfolio.views || 0}</p>
        <a class="btn" href="/p/${portfolio.slug}">View</a>
        <a class="btn" href="/builder.html?id=${portfolio.slug}">Edit</a>
        <button class="btn delete-dashboard" data-slug="${portfolio.slug}">Delete</button>
      `;
      dashboardContainer.appendChild(card);
    });

    document.querySelectorAll(".delete-dashboard").forEach(btn => {
      btn.addEventListener("click", async function () {
        const slug = this.dataset.slug;
        if (!confirm("Delete this portfolio?")) return;
        await fetch(API_URL + "/" + slug, { method: "DELETE" });
        loadDashboardPortfolios();
      });
    });
  } catch (error) {
    console.error(error);
  }
}

/* WELCOME USER */
const welcomeUser = document.getElementById("welcomeUser");
if (welcomeUser) {
  const userName = localStorage.getItem("userName");
  welcomeUser.innerText = userName ? "Welcome, " + userName + " 👋" : "";
}

/* PROFILE PAGE */
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
if (profileName && profileEmail) {
  profileName.innerText = localStorage.getItem("userName") || "Unknown";
  profileEmail.innerText = localStorage.getItem("userEmail") || "Unknown";
}

/* CHANGE PASSWORD */
const changePasswordBtn = document.getElementById("changePasswordBtn");
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", async function () {
    const email = localStorage.getItem("userEmail");
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const response = await fetch("https://portfolio-backend-au16.onrender.com/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, currentPassword, newPassword })
    });
    if (response.ok) {
      alert("Password updated successfully ✅");
    } else {
      alert("Password update failed ❌");
    }
  });
}

/* ADMIN STATS */
const totalUsers = document.getElementById("totalUsers");
const totalPortfolios = document.getElementById("totalPortfolios");
const totalViews = document.getElementById("totalViews");
if (totalUsers && totalPortfolios && totalViews) {
  fetch("https://portfolio-backend-au16.onrender.com/api/admin/stats")
    .then(res => res.json())
    .then(stats => {
      totalUsers.innerText = stats.totalUsers;
      totalPortfolios.innerText = stats.totalPortfolios;
      totalViews.innerText = stats.totalViews;
    })
    .catch(err => console.error(err));
}

/* ADMIN PAGE PROTECTION */
if (window.location.pathname.includes("admin.html")) {
  const userRole = localStorage.getItem("userRole");
  if (userRole !== "ADMIN") {
    alert("Access Denied. Admin only.");
    window.location.href = "dashboard.html";
  }
}

const adminBtn = document.getElementById("adminBtn");
if (adminBtn) {
  const adminEmail = "mali8699031@gmail.com";
  const userEmail = localStorage.getItem("userEmail");
  if (userEmail !== adminEmail) adminBtn.style.display = "none";
}

async function deletePortfolio(slug) {
  if (!confirm("Are you sure you want to delete this portfolio?")) return;
  try {
    await fetch(`${API_URL}/api/portfolios/${slug}`, { method: "DELETE" });
    alert("Portfolio deleted successfully");
    loadDashboardPortfolios();
  } catch (error) {
    console.error(error);
    alert("Failed to delete portfolio");
  }
}