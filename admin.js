const ADMIN_SESSION_KEY = "tharinayambyaisha-admin-session-v1";
const DEFAULT_ADMIN_USER = "admin";
const DEFAULT_ADMIN_PASS = "admin123";
const ADMIN_CREDENTIALS_KEY = "tharinayambyaisha-admin-credentials-v1";

const loginPanel = document.getElementById("loginPanel");
const dashboardPanel = document.getElementById("dashboardPanel");
const loginForm = document.getElementById("loginForm");
const productForm = document.getElementById("productForm");
const catalogList = document.getElementById("catalogList");
const loginStatus = document.getElementById("loginStatus");
const productStatus = document.getElementById("productStatus");
const formTitle = document.getElementById("formTitle");
const cancelEditButton = document.getElementById("cancelEdit");
const logoutButton = document.getElementById("logoutButton");
const productImageInput = document.getElementById("productImage");
const productImageUpload = document.getElementById("productImageUpload");
const productImagePreview = document.getElementById("productImagePreview");

let editingId = null;

function getDefaultCredentials() {
  return { username: DEFAULT_ADMIN_USER, password: DEFAULT_ADMIN_PASS };
}

function getStoredCredentials() {
  try {
    const stored = JSON.parse(localStorage.getItem(ADMIN_CREDENTIALS_KEY) || "null");
    if (stored && stored.username && stored.password) return stored;
  } catch (error) {
    console.warn("Admin credentials could not be read.", error);
  }

  const defaults = getDefaultCredentials();
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(defaults));
  return defaults;
}

function setCredentials(username, password) {
  const sanitizedUsername = String(username || "").trim();
  const sanitizedPassword = String(password || "").trim();

  if (!sanitizedUsername || !sanitizedPassword) return;
  const payload = { username: sanitizedUsername, password: sanitizedPassword };
  localStorage.setItem(ADMIN_CREDENTIALS_KEY, JSON.stringify(payload));
}

function getProducts() {
  const stored = JSON.parse(localStorage.getItem(window.catalogStorageKey) || "null");
  if (Array.isArray(stored) && stored.length) return stored;
  return Array.isArray(window.SAREES) ? [...window.SAREES] : [];
}

function saveProducts(products) {
  localStorage.setItem(window.catalogStorageKey, JSON.stringify(products));
  window.SAREES = products;
}

function setLoginStatus(message, isError = false) {
  loginStatus.textContent = message || "";
  loginStatus.classList.toggle("error", Boolean(isError));
  loginStatus.classList.toggle("success", !isError && Boolean(message));
}

function setProductStatus(message, isError = false) {
  productStatus.textContent = message || "";
  productStatus.classList.toggle("error", Boolean(isError));
  productStatus.classList.toggle("success", !isError && Boolean(message));
}

function toggleAuthScreens(isAuthenticated) {
  loginPanel.classList.toggle("visible", !isAuthenticated);
  dashboardPanel.classList.toggle("visible", isAuthenticated);
}

function ensureAuth() {
  const isLoggedIn = sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
  toggleAuthScreens(isLoggedIn);
}

function resetForm() {
  productForm.reset();
  editingId = null;
  formTitle.textContent = "Add new saree";
  if (productImagePreview) {
    productImagePreview.hidden = true;
    productImagePreview.removeAttribute("src");
  }
  setProductStatus("");
}

function generateProductId(products) {
  const nextNumber = products.length + 1;
  return `THA-${String(nextNumber).padStart(3, "0")}`;
}

function renderCatalog() {
  const products = getProducts();

  if (!products.length) {
    catalogList.innerHTML = "<p class='helper-text'>No sarees yet. Add the first item to begin.</p>";
    return;
  }

  catalogList.innerHTML = products.map(product => `
    <article class="catalog-item">
      <img src="${product.image || "assets/images/placeholder.jpg"}" alt="${product.name || "Product image"}" />
      <div class="catalog-meta">
        <strong>${product.id || "No ID"}</strong>
        <span>${product.name}</span>
        <small>${product.color}</small>
      </div>
      <div class="catalog-actions">
        <button type="button" class="button ghost" data-edit="${product.id}">Edit</button>
        <button type="button" class="button danger" data-delete="${product.id}">Delete</button>
      </div>
    </article>
  `).join("");
}

function fillForm(product) {
  document.getElementById("productId").value = product.id || "";
  document.getElementById("productName").value = product.name || "";
  document.getElementById("productTagline").value = product.tagline || "";
  document.getElementById("productImage").value = product.image || "";
  if (productImagePreview) {
    const previewSource = product.image || "";
    productImagePreview.src = previewSource;
    productImagePreview.hidden = !previewSource;
  }
  document.getElementById("productColor").value = product.color || "";
  document.getElementById("productBody").value = product.body || "";
  document.getElementById("productBorder").value = product.border || "";
  document.getElementById("productLook").value = product.look || "";
  document.getElementById("productOccasion").value = product.occasion || "";
  document.getElementById("productDescription").value = product.description || "";
  formTitle.textContent = "Edit saree";
  editingId = product.id;
}

async function handleImageUpload(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    const base64Image = String(reader.result || "");
    if (productImageInput) productImageInput.value = base64Image;
    if (productImagePreview) {
      productImagePreview.src = base64Image;
      productImagePreview.hidden = false;
    }
  };
  reader.readAsDataURL(file);
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(loginForm);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();
  const credentials = getStoredCredentials();

  if (username === credentials.username && password === credentials.password) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    setLoginStatus("Login successful.");
    ensureAuth();
    renderCatalog();
    return;
  }

  setLoginStatus("Invalid username or password.", true);
}

function handleProductSubmit(event) {
  event.preventDefault();
  const formData = new FormData(productForm);
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const tagline = String(formData.get("tagline") || "").trim();
  const image = String(formData.get("image") || "").trim();
  const color = String(formData.get("color") || "").trim();
  const body = String(formData.get("body") || "").trim();
  const border = String(formData.get("border") || "").trim();
  const look = String(formData.get("look") || "").trim();
  const occasion = String(formData.get("occasion") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!name || !tagline || !image || !color || !body || !border || !look || !occasion || !description) {
    setProductStatus("Please complete all product fields.", true);
    return;
  }

  const products = getProducts();
  const finalId = id || (editingId || generateProductId(products));

  if (!editingId && products.some(product => product.id.toLowerCase() === finalId.toLowerCase())) {
    setProductStatus("A saree with this ID already exists.", true);
    return;
  }

  const productRecord = {
    id: finalId,
    name,
    tagline,
    description,
    color,
    body,
    border,
    look,
    occasion,
    price: null,
    fabric: null,
    image
  };

  let nextProducts;
  if (editingId) {
    nextProducts = products.map(product => product.id === editingId ? productRecord : product);
    setProductStatus("Product updated successfully.");
  } else {
    nextProducts = [...products, productRecord];
    setProductStatus("Product added successfully.");
  }

  saveProducts(nextProducts);
  renderCatalog();
  resetForm();
}

function handleCatalogClick(event) {
  const editButton = event.target.closest("[data-edit]");
  if (editButton) {
    const id = editButton.getAttribute("data-edit");
    const product = getProducts().find(item => item.id === id);
    if (product) fillForm(product);
    return;
  }

  const deleteButton = event.target.closest("[data-delete]");
  if (deleteButton) {
    const id = deleteButton.getAttribute("data-delete");
    const products = getProducts().filter(item => item.id !== id);
    saveProducts(products);
    renderCatalog();
    if (editingId === id) resetForm();
    setProductStatus("Product deleted.");
  }
}

loginForm.addEventListener("submit", handleLogin);
productForm.addEventListener("submit", handleProductSubmit);
if (productImageUpload) productImageUpload.addEventListener("change", handleImageUpload);
cancelEditButton.addEventListener("click", resetForm);
logoutButton.addEventListener("click", () => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  ensureAuth();
  setLoginStatus("");
  resetForm();
});
catalogList.addEventListener("click", handleCatalogClick);

ensureAuth();
resetForm();
renderCatalog();

window.addEventListener("storage", event => {
  if (event.key === window.catalogStorageKey) {
    renderCatalog();
  }
});
