const API_URL = "http://localhost:8080/api/portfolios";

const form = document.getElementById("portfolioForm");

const addProjectBtn = document.getElementById("addProjectBtn");
const projectsContainer = document.getElementById("projectsContainer");

const addCertBtn = document.getElementById("addCertBtn");
const certificationsContainer = document.getElementById("certificationsContainer");

const addExperienceBtn = document.getElementById("addExperienceBtn");
const experienceContainer = document.getElementById("experienceContainer");

const params = new URLSearchParams(window.location.search);
const currentSlug = params.get("id");

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
    <input type="text" class="projectTitle" placeholder="Project Title" value="${project.title || ""}">
    <textarea class="projectDescription" placeholder="Project Description" rows="4">${project.description || ""}</textarea>
    <input type="text" class="projectTech" placeholder="Technologies, comma separated" value="${project.tech ? project.tech.join(",") : ""}">
    <input type="text" class="projectLink" placeholder="Project / GitHub Link" value="${project.link || ""}">
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
    <input type="text" class="certTitle" placeholder="Certificate Title" value="${cert.title || ""}">
    <input type="text" class="certProvider" placeholder="Provider / Organization" value="${cert.provider || ""}">
    <input type="text" class="certYear" placeholder="Year" value="${cert.year || ""}">
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
    <input type="text" class="expTitle" placeholder="Experience Title" value="${exp.title || ""}">
    <input type="text" class="expYear" placeholder="Year / Duration" value="${exp.year || ""}">
    <textarea class="expDescription" placeholder="Description" rows="4">${exp.description || ""}</textarea>
  `;

  experienceContainer.appendChild(div);
}

/* BUILDER SUBMIT */
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const getValue = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : "";
    };

    const projects = Array.from(document.querySelectorAll(".project-input")).map(block => ({
      title: block.querySelector(".projectTitle").value,
      description: block.querySelector(".projectDescription").value,
      tech: block.querySelector(".projectTech").value.split(","),
      link: block.querySelector(".projectLink").value
    }));

    const certifications = Array.from(document.querySelectorAll(".cert-input")).map(block => ({
      title: block.querySelector(".certTitle").value,
      provider: block.querySelector(".certProvider").value,
      year: block.querySelector(".certYear").value
    }));

    const experiences = Array.from(document.querySelectorAll(".experience-input")).map(block => ({
      title: block.querySelector(".expTitle").value,
      year: block.querySelector(".expYear").value,
      description: block.querySelector(".expDescription").value
    }));

    const data = {
      name: getValue("name"),
      role: getValue("role"),
      about: getValue("about"),
      skills: getValue("skills").split(","),
      github: getValue("github"),
      linkedin: getValue("linkedin"),
      email: getValue("email"),
      phone: getValue("phone"),
      projects,
      certifications,
      experiences,
      image: ""
    };

    const fileInput = document.getElementById("profileImage");
    const file = fileInput ? fileInput.files[0] : null;

    const saveAndRedirect = () => {
      localStorage.setItem("portfolioData", JSON.stringify(data));
      window.location.href = "preview.html";
    };

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be below 2MB");
        return;
      }

      const reader = new FileReader();

      reader.onloadend = function () {
        data.image = reader.result;
        saveAndRedirect();
      };

      reader.readAsDataURL(file);
    } else {
      saveAndRedirect();
    }
  });
}

/* LOAD PORTFOLIO */
let data = null;

async function loadPortfolio() {
  const page = window.location.pathname;

  if (currentSlug && page.includes("builder.html")) {
    const response = await fetch(API_URL + "/" + currentSlug);
    const portfolio = await response.json();
    fillBuilderForm(portfolio);
    return;
  }

  if (currentSlug) {
    const response = await fetch(API_URL + "/" + currentSlug);
    data = await response.json();

    data.skills = data.skills ? data.skills.split(",") : [];
    data.projects = data.projects ? JSON.parse(data.projects) : [];
    data.certifications = data.certifications ? JSON.parse(data.certifications) : [];
    data.experiences = data.experiences ? JSON.parse(data.experiences) : [];

    renderPortfolio();
  } else {
    data = JSON.parse(localStorage.getItem("portfolioData"));
    renderPortfolio();
  }
}

loadPortfolio();

/* FILL BUILDER FORM */
function fillBuilderForm(data) {
  document.getElementById("name").value = data.name || "";
  document.getElementById("role").value = data.role || "";
  document.getElementById("about").value = data.about || "";
  document.getElementById("skills").value = data.skills || "";
  document.getElementById("github").value = data.github || "";
  document.getElementById("linkedin").value = data.linkedin || "";
  document.getElementById("email").value = data.email || "";
  document.getElementById("phone").value = data.phone || "";

  if (data.projects) {
    projectsContainer.innerHTML = "";
    JSON.parse(data.projects).forEach(project => addProjectInput(project));
  }

  if (data.certifications) {
    certificationsContainer.innerHTML = "";
    JSON.parse(data.certifications).forEach(cert => addCertInput(cert));
  }

  if (data.experiences) {
    experienceContainer.innerHTML = "";
    JSON.parse(data.experiences).forEach(exp => addExperienceInput(exp));
  }
}

/* RENDER PORTFOLIO */
function renderPortfolio() {
  if (!data) return;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "";
  };

  const setHref = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.href = value || "#";
  };

  const previewImage = document.getElementById("previewImage");

  if (previewImage && data.image) {
    previewImage.src = data.image;
  }

  setText("previewName", data.name);
  setText("previewRole", data.role);
  setText("previewAbout", data.about);

  setText("previewEmail", data.email);
  setHref("previewEmail", "mailto:" + data.email);

  setHref("previewGithub", data.github);
  setHref("previewLinkedin", data.linkedin);

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

      const techHtml = project.tech
        .filter(t => t.trim())
        .map(t => `<span>${t.trim()}</span>`)
        .join("");

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

      card.innerHTML = `
        <h3>${cert.title}</h3>
        <p>${cert.provider}</p>
        <p>${cert.year}</p>
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

      card.innerHTML = `
        <h3>${exp.title}</h3>
        <span>${exp.year}</span>
        <p>${exp.description}</p>
      `;

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

    const payload = {
      name: data.name,
      role: data.role,
      about: data.about,
      skills: data.skills.join(","),
      github: data.github,
      linkedin: data.linkedin,
      email: data.email,
      phone: data.phone,
      image: data.image,
      slug,
      projects: JSON.stringify(data.projects),
      certifications: JSON.stringify(data.certifications),
      experiences: JSON.stringify(data.experiences)
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to publish portfolio");
      }

      alert("Portfolio Published Successfully 🚀");
      window.location.href = "./public.html?id=" + slug;

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
    if (!currentSlug) {
      alert("Portfolio ID not found");
      return;
    }

    window.location.href = "./builder.html?id=" + currentSlug;
  });
}

/* COPY LINK */
const copyLinkBtn = document.getElementById("copyLinkBtn");

if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", function () {
    navigator.clipboard.writeText(window.location.href);
    copyLinkBtn.innerText = "Link Copied ✅";

    setTimeout(function () {
      copyLinkBtn.innerText = "Copy Portfolio Link";
    }, 2000);
  });
}

/* THREE JS BACKGROUND */
const canvas = document.getElementById("bg");

if (canvas && typeof THREE !== "undefined") {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.position.z = 30;

  const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);

  const material = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    wireframe: true
  });

  const torus = new THREE.Mesh(geometry, material);
  scene.add(torus);

  const light = new THREE.PointLight(0xffffff);
  light.position.set(20, 20, 20);

  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(light, ambient);

  function animate() {
    requestAnimationFrame(animate);

    torus.rotation.x += 0.002;
    torus.rotation.y += 0.003;

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });
}