const API_URL = "/api/orders";

const form = document.getElementById("orderForm");
const table = document.getElementById("ordersTable");
const message = document.getElementById("message");

async function loadOrders() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("No se pudieron cargar los pedidos");
        }

        const orders = await response.json();
        table.replaceChildren();

        for (const order of orders) {
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
    } catch (error) {
        message.textContent = error.message;
    }
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const order = {
        customer: document.getElementById("customer").value,
        product: document.getElementById("product").value,
        quantity: Number(document.getElementById("quantity").value)
    };

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(order)
        });

        if (!response.ok) {
            throw new Error("No se pudo crear el pedido");
        }

        message.textContent = "Pedido creado correctamente";
        form.reset();
        await loadOrders();
    } catch (error) {
        message.textContent = error.message;
    }
});

document.getElementById("refreshButton")
    .addEventListener("click", loadOrders);

loadOrders();