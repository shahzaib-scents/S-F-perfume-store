let cart = [];

const ORDER_EMAIL = "shahzaibsarwar2006@gmail.com";
const DELIVERY_ADVANCE = 250;

function money(n) {
  return `Rs. ${Number(n).toLocaleString("en-PK")}`;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product ${p.inStock ? "" : "out-of-stock"}">
      <div class="product-photo-wrap">
        <img src="${p.image}" alt="${p.name}" class="product-image">
        ${p.inStock ? "" : '<span class="stock-label">OUT OF STOCK</span>'}
      </div>
      <div class="product-info">
        <p class="eyebrow">${p.size} • ${p.lasting}</p>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="price"><del>${money(p.oldPrice)}</del> <strong>${money(p.price)}</strong></div>
        ${p.inStock
          ? `<button class="button full" type="button" onclick="addToCart('${p.id}')">Add to Cart</button>`
          : '<button class="button full disabled-button" type="button" disabled>Out of Stock</button>'}
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product || !product.inStock) return;
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ id, qty: 1 });
  updateCart();
  openCart();
}

function updateCart() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").textContent = count;
  const box = document.getElementById("cart-items");

  if (!cart.length) {
    box.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    box.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(product => product.id === item.id);
      return `<div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div class="cart-item-details">
          <strong>${p.name}</strong><br>${money(p.price)} × ${item.qty}
          <div class="qty">
            <button type="button" aria-label="Decrease quantity" onclick="changeQty('${p.id}', -1)">−</button>
            <span>${item.qty}</span>
            <button type="button" aria-label="Increase quantity" onclick="changeQty('${p.id}', 1)">+</button>
          </div>
        </div>
      </div>`;
    }).join("");
  }

  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);
  document.getElementById("cart-total").textContent = money(subtotal);
}

function changeQty(id, delta) {
  const item = cart.find(x => x.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => x.id !== id);
  updateCart();
}

function openCart() {
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "false");
}
function closeCart() {
  document.getElementById("cart-drawer").setAttribute("aria-hidden", "true");
}

// This static-site order reference is unique-looking, but is not a central sequential counter.
function createOrderNumber() {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SF-${datePart}-${randomPart}`;
}

document.getElementById("order-form").addEventListener("submit", async function (event) {
  event.preventDefault();

  if (!cart.length) {
    alert("Your cart is empty. Please add a product first.");
    return;
  }

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();
  const address = document.getElementById("customer-address").value.trim();
  const status = document.getElementById("order-status");
  const button = document.getElementById("confirm-order-btn");

  if (!name || !phone || !city || !address) {
    alert("Please complete all delivery details.");
    return;
  }

  const orderNumber = createOrderNumber();
  const lines = cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `${p.name} × ${item.qty} — ${money(p.price * item.qty)}`;
  });

  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);

  const orderData = {
    _subject: `New S&F Website Order ${orderNumber}`,
    _template: "table",
    "Order Number": orderNumber,
    "Customer Name": name,
    "Customer Phone": phone,
    "Customer City": city,
    "Complete Address": address,
    "Products": lines.join("\n"),
    "Product Subtotal": money(subtotal),
    "Delivery Advance": money(DELIVERY_ADVANCE),
    "Total Including Delivery Advance": money(subtotal + DELIVERY_ADVANCE)
  };

  button.disabled = true;
  button.textContent = "Submitting...";
  status.textContent = "Submitting your order. Please wait.";
  status.className = "order-status";

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${ORDER_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();
    if (!response.ok || result.success !== "true") {
      throw new Error(result.message || "Order could not be submitted.");
    }

    status.textContent = `Thank you! Your order has been submitted. Your order number is ${orderNumber}. S&F will contact you soon.`;
    status.className = "order-status success";
    cart = [];
    updateCart();
    document.getElementById("order-form").reset();
  } catch (error) {
    console.error("Order submission error:", error);
    status.textContent = "Sorry, your order could not be submitted right now. Please try again in a moment or contact S&F on WhatsApp.";
    status.className = "order-status error";
  } finally {
    button.disabled = false;
    button.textContent = "Confirm Order";
  }
});

renderProducts();
updateCart();
