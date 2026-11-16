
const API_URL = "/api/orders";

const form = document.getElementById("orderForm");
const table = document.getElementById("ordersTable");
const message = document.getElementById("message");
const search = document.getElementById("searchOrders");
const emptyState = document.getElementById("emptyState");
const submitButton = document.getElementById("submitButton");

let orders = [];

function showMessage(text, type = "") {
  message.textContent = text;
  message.className = type;
}

function updateStats() {
  document.getElementById("totalOrders").textContent = orders.length;

  document.getElementById("totalUnits").textContent =
    orders.reduce((total, order) => total + Number(order.quantity), 0);

  document.getElementById("totalProducts").textContent =
    new Set(orders.map(order => order.product.trim().toLowerCase())).size;
}

function renderOrders() {
  const query = search.value.trim().toLowerCase();

  const filtered = orders.filter(order =>
    order.customer.toLowerCase().includes(query) ||
    order.product.toLowerCase().includes(query) ||
    String(order.id).includes(query)
  );

  table.replaceChildren();

  for (const order of filtered) {
    const row = document.createElement("tr");

    for (const value of [
      order.id,
      order.customer,
      order.product,
      order.quantity
    ]) {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    }

    table.appendChild(row);
  }

  emptyState.hidden = filtered.length !== 0;
}

async function loadOrders() {
  try {
    const response = await fetch(API_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("No se pudieron cargar los pedidos");
    }

    orders = await response.json();
    updateStats();
    renderOrders();
  } catch (error) {
    showMessage(error.message, "error");
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const order = {
    customer: document.getElementById("customer").value.trim(),
    product: document.getElementById("product").value.trim(),
    quantity: Number(document.getElementById("quantity").value)
  };

  if (!order.customer || !order.product ||
      !Number.isInteger(order.quantity) || order.quantity < 1) {
    showMessage("Introduce datos válidos.", "error");
    return;
  }

  submitButton.disabled = true;
  showMessage("Registrando pedido...");

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order)
    });

    if (!response.ok) {
      throw new Error("No se pudo crear el pedido");
    }

    form.reset();
    showMessage("Pedido creado correctamente", "success");
    await loadOrders();
  } catch (error) {
    showMessage(error.message, "error");
  } finally {
    submitButton.disabled = false;
  }
});

search.addEventListener("input", renderOrders);

document.getElementById("refreshButton")
  .addEventListener("click", loadOrders);

loadOrders();
