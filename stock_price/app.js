// Simple Inventory Management - browser only (no backend)
// Data is saved in localStorage so it persists between refreshes.

const STORAGE_KEYS = {
  PRODUCTS: "inventory_products_v1",
  MOVEMENTS: "inventory_movements_v1",
};

let products = [];
let movements = [];

// Helpers
function loadFromStorage() {
  try {
    const p = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    const m = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    products = p ? JSON.parse(p) : [];
    movements = m ? JSON.parse(m) : [];
  } catch (e) {
    console.error("Failed to load from storage", e);
    products = [];
    movements = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
}

function formatCurrency(n) {
  const num = Number(n) || 0;
  return "₹" + num.toFixed(2);
}

function uuid() {
  return "id-" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// DOM References
const dom = {};

function cacheDom() {
  dom.productForm = document.getElementById("product-form");
  dom.productId = document.getElementById("product-id");
  dom.productName = document.getElementById("product-name");
  dom.productSku = document.getElementById("product-sku");
  dom.productCategory = document.getElementById("product-category");
  dom.productQuantity = document.getElementById("product-quantity");
  dom.productReorder = document.getElementById("product-reorder");
  dom.productPrice = document.getElementById("product-price");
  dom.btnResetForm = document.getElementById("btn-reset-form");
  dom.productFormTitle = document.getElementById("product-form-title");

  dom.productsTableBody = document.querySelector("#products-table tbody");
  dom.searchInput = document.getElementById("search-input");

  dom.stockForm = document.getElementById("stock-form");
  dom.stockProduct = document.getElementById("stock-product");
  dom.stockType = document.getElementById("stock-type");
  dom.stockQuantity = document.getElementById("stock-quantity");
  dom.stockNote = document.getElementById("stock-note");
  dom.movementsTableBody = document.querySelector("#movements-table tbody");

  dom.statTotalProducts = document.getElementById("stat-total-products");
  dom.statTotalQuantity = document.getElementById("stat-total-quantity");
  dom.statInventoryValue = document.getElementById("stat-inventory-value");
  dom.statLowStock = document.getElementById("stat-low-stock");
}

// Rendering
function renderProducts(filterText = "") {
  const query = filterText.trim().toLowerCase();
  const rows = [];

  products.forEach((p) => {
    if (query) {
      const hay = (p.name + p.sku + (p.category || "")).toLowerCase();
      if (!hay.includes(query)) return;
    }

    let statusClass = "ok";
    let statusLabel = "OK";
    if (p.quantity <= 0) {
      statusClass = "out";
      statusLabel = "Out of Stock";
    } else if (p.quantity <= p.reorderLevel) {
      statusClass = "low";
      statusLabel = "Low";
    }

    const totalValue = p.quantity * p.price;

    rows.push(
      `<tr>
        <td>${p.name}</td>
        <td>${p.sku}</td>
        <td>${p.category || "-"}</td>
        <td>${p.quantity}</td>
        <td>${p.reorderLevel}</td>
        <td>${formatCurrency(p.price)}</td>
        <td>${formatCurrency(totalValue)}</td>
        <td>
          <span class="badge ${statusClass}">
            <span class="status-dot"></span>${statusLabel}
          </span>
        </td>
        <td>
          <button class="btn small" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn small danger" data-action="delete" data-id="${p.id}">Delete</button>
        </td>
      </tr>`
    );
  });

  dom.productsTableBody.innerHTML = rows.join("") || `<tr><td colspan="9">No products yet. Add one on the left.</td></tr>`;
}

function renderProductOptions() {
  const options = ['<option value="">Select product</option>'].concat(
    products.map((p) => `<option value="${p.id}">${p.name} (${p.sku})</option>`)
  );
  dom.stockProduct.innerHTML = options.join("");
}

function renderMovements() {
  const sorted = [...movements].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20);

  const rows = sorted.map((m) => {
    const product = products.find((p) => p.id === m.productId);
    const productLabel = product ? `${product.name} (${product.sku})` : "(deleted product)";
    const date = new Date(m.timestamp);
    const typeClass = m.type === "in" ? "in" : "out";
    const typeLabel = m.type === "in" ? "Stock In" : "Stock Out";

    return `<tr>
      <td>${date.toLocaleString()}</td>
      <td>${productLabel}</td>
      <td><span class="tag ${typeClass}">${typeLabel}</span></td>
      <td>${m.quantity}</td>
      <td>${m.note || "-"}</td>
    </tr>`;
  });

  dom.movementsTableBody.innerHTML = rows.join("") || `<tr><td colspan="5">No stock movements yet.</td></tr>`;
}

function renderStats() {
  const totalProducts = products.length;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0);
  const lowStock = products.filter((p) => p.quantity > 0 && p.quantity <= p.reorderLevel).length;

  dom.statTotalProducts.textContent = totalProducts;
  dom.statTotalQuantity.textContent = totalQuantity;
  dom.statInventoryValue.textContent = formatCurrency(inventoryValue);
  dom.statLowStock.textContent = lowStock;
}

function fullRender() {
  const searchVal = dom.searchInput.value || "";
  renderProducts(searchVal);
  renderProductOptions();
  renderMovements();
  renderStats();
}

// Product form
function resetProductForm() {
  dom.productId.value = "";
  dom.productName.value = "";
  dom.productSku.value = "";
  dom.productCategory.value = "";
  dom.productQuantity.value = "0";
  dom.productReorder.value = "5";
  dom.productPrice.value = "0";
  dom.productFormTitle.textContent = "Add / Edit Product";
}

function handleProductSubmit(e) {
  e.preventDefault();

  const id = dom.productId.value || uuid();
  const name = dom.productName.value.trim();
  const sku = dom.productSku.value.trim();
  const category = dom.productCategory.value.trim();
  const quantity = Number(dom.productQuantity.value) || 0;
  const reorderLevel = Number(dom.productReorder.value) || 0;
  const price = Number(dom.productPrice.value) || 0;

  if (!name || !sku) {
    alert("Name and SKU are required.");
    return;
  }

  const existingIndex = products.findIndex((p) => p.id === id);
  const base = { id, name, sku, category, quantity, reorderLevel, price };

  if (existingIndex >= 0) {
    products[existingIndex] = base;
  } else {
    products.push(base);
  }

  saveToStorage();
  fullRender();
  resetProductForm();
}

function handleProductsTableClick(e) {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");

  if (action === "edit") {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    dom.productId.value = product.id;
    dom.productName.value = product.name;
    dom.productSku.value = product.sku;
    dom.productCategory.value = product.category || "";
    dom.productQuantity.value = product.quantity;
    dom.productReorder.value = product.reorderLevel;
    dom.productPrice.value = product.price;
    dom.productFormTitle.textContent = "Edit Product";
  } else if (action === "delete") {
    const product = products.find((p) => p.id === id);
    if (!product) return;

    if (!confirm(`Delete product "${product.name}"? This will not delete existing movement history.`)) {
      return;
    }
    products = products.filter((p) => p.id !== id);
    saveToStorage();
    fullRender();
  }
}

// Stock movements
function handleStockSubmit(e) {
  e.preventDefault();

  const productId = dom.stockProduct.value;
  const type = dom.stockType.value;
  const qty = Number(dom.stockQuantity.value) || 0;
  const note = dom.stockNote.value.trim();

  if (!productId) {
    alert("Please select a product.");
    return;
  }
  if (!qty || qty <= 0) {
    alert("Quantity must be greater than zero.");
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    alert("Product not found.");
    return;
  }

  if (type === "out" && product.quantity < qty) {
    alert("Not enough stock available.");
    return;
  }

  if (type === "in") {
    product.quantity += qty;
  } else {
    product.quantity -= qty;
  }

  movements.push({
    id: uuid(),
    productId,
    type,
    quantity: qty,
    note,
    timestamp: Date.now(),
  });

  saveToStorage();
  fullRender();

  dom.stockQuantity.value = "1";
  dom.stockNote.value = "";
}

// Initialization
function attachEvents() {
  dom.productForm.addEventListener("submit", handleProductSubmit);
  dom.btnResetForm.addEventListener("click", resetProductForm);
  dom.productsTableBody.addEventListener("click", handleProductsTableClick);
  dom.stockForm.addEventListener("submit", handleStockSubmit);
  dom.searchInput.addEventListener("input", () => renderProducts(dom.searchInput.value || ""));
}

function bootstrapDemoIfEmpty() {
  if (products.length > 0) return;

  const demo = [
    {
      id: uuid(),
      name: "HP Laptop 15s",
      sku: "LAP-HP-15S",
      category: "Laptop",
      quantity: 8,
      reorderLevel: 3,
      price: 45000,
    },
    {
      id: uuid(),
      name: "Logitech Wireless Mouse",
      sku: "MOU-LOGI-M185",
      category: "Accessories",
      quantity: 25,
      reorderLevel: 10,
      price: 699,
    },
    {
      id: uuid(),
      name: "Seagate 1TB HDD",
      sku: "HDD-SG-1TB",
      category: "Storage",
      quantity: 5,
      reorderLevel: 5,
      price: 3500,
    },
  ];

  products = demo;
  saveToStorage();
}

document.addEventListener("DOMContentLoaded", () => {
  cacheDom();
  loadFromStorage();
  bootstrapDemoIfEmpty();
  attachEvents();
  fullRender();
});


