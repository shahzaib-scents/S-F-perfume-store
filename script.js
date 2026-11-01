let cart = [];

const WHATSAPP_NUMBER = "923124974060";
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
        <div class="price">${p.oldPrice ? `<del>${money(p.oldPrice)}</del>` : ""} <strong>${money(p.price)}</strong></div>
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

// A timestamp-based reference works on this static website without a server.
// A central sequential order counter would require a shared database/backend.
function createOrderNumber() {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("");
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SF-${datePart}-${randomPart}`;
}

document.getElementById("order-form").addEventListener("submit", function (event) {
  event.preventDefault();

  if (!cart.length) {
    alert("Your cart is empty. Please add a product first.");
    return;
  }

  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const city = document.getElementById("customer-city").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  if (!name || !phone || !city || !address) {
    alert("Please complete all delivery details.");
    return;
  }

  const orderNumber = createOrderNumber();
  const lines = cart.map(item => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return `• ${p.name} × ${item.qty} — ${money(p.price * item.qty)}`;
  });

  const subtotal = cart.reduce((sum, item) => {
    const p = PRODUCTS.find(product => product.id === item.id);
    return sum + p.price * item.qty;
  }, 0);

  const message = [
    "*NEW ORDER — S&F PERFUME*",
    "",
    `*Order No:* ${orderNumber}`,
    "",
    "*Products:*",
    ...lines,
    "",
    `*Product Total:* ${money(subtotal)}`,
    `*Delivery Advance:* ${money(DELIVERY_ADVANCE)}`,
    `*Total Including Delivery Advance:* ${money(subtotal + DELIVERY_ADVANCE)}`,
    "",
    "*Customer Details:*",
    `*Name:* ${name}`,
    `*Phone:* ${phone}`,
    `*City:* ${city}`,
    `*Address:* ${address}`
  ].join("\n");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank", "noopener");

  // Keep cart intact until the customer returns; WhatsApp requires the customer to press Send.
});

renderProducts();
updateCart();
