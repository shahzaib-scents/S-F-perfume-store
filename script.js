let cart = [];

function money(n) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}

function renderProducts() {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-image"><img src="${p.image}" alt="${p.name}"></div>
      <div class="product-info">
        <p class="eyebrow">${p.size} • ${p.lasting}</p>
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        <div class="price"><del>${money(p.oldPrice)}</del> <strong>${money(p.price)}</strong></div>
        <button class="button full" onclick="addToCart('${p.id}')">Add to Cart</button>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({id, qty: 1});
  updateCart();
  openCart();
}

function updateCart() {
  const count = cart.reduce((s, x) => s + x.qty, 0);
  document.getElementById("cart-count").textContent = count;
  const box = document.getElementById("cart-items");
  if (!cart.length) {
    box.innerHTML = "<p>Your cart is empty.</p>";
  } else {
    box.innerHTML = cart.map(item => {
      const p = PRODUCTS.find(x => x.id === item.id);
      return `<div class="cart-item">
        <img src="${p.image}" alt="">
        <div><strong>${p.name}</strong><br>${money(p.price)} × ${item.qty}
        <div class="qty"><button onclick="changeQty('${p.id}', -1)">−</button><span>${item.qty}</span><button onclick="changeQty('${p.id}', 1)">+</button></div></div>
      </div>`;
    }).join("");
  }
  document.getElementById("cart-total").textContent = money(cart.reduce((s, x) => {
    const p = PRODUCTS.find(p => p.id === x.id); return s + p.price * x.qty;
  }, 0));
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
function openCheckout() {
  if (!cart.length) return alert("Your cart is empty.");
  closeCart();
  const total = cart.reduce((s, x) => {
    const p = PRODUCTS.find(p => p.id === x.id); return s + p.price * x.qty;
  }, 0);
  document.getElementById("order-summary").innerHTML =
    `<strong>Products: ${money(total)}</strong><br>Delivery advance: Rs. 250`;
  document.getElementById("checkout").setAttribute("aria-hidden", "false");
}
function closeCheckout() {
  document.getElementById("checkout").setAttribute("aria-hidden", "true");
}

document.getElementById("checkout-form").addEventListener("submit", e => {
  e.preventDefault();
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const address = document.getElementById("customer-address").value.trim();

  const lines = cart.map(x => {
    const p = PRODUCTS.find(p => p.id === x.id);
    return `• ${p.name} × ${x.qty} — ${money(p.price * x.qty)}`;
  });

  const total = cart.reduce((s, x) => {
    const p = PRODUCTS.find(p => p.id === x.id); return s + p.price * x.qty;
  }, 0);
    function sendToWhatsApp(productName, price) {
    // Get data from the form
    let name = document.getElementById('customer-name').value;
    let address = document.getElementById('customer-address').value;
    let phone = document.getElementById('customer-phone').value;

    // Check if form is empty
    if(!name || !address || !phone) {
        alert('Please fill in Name, Address and Phone Number first');
        return;
    }

    // Create WhatsApp message
    let message = `*New Order* 📦%0A%0A`;
    message += `*Product:* ${productName}%0A`;
    message += `*Price:* ${price} PKR%0A%0A`;
    message += `*Name:* ${name}%0A`;
    message += `*Address:* ${address}%0A`;
    message += `*Phone:* ${phone}%0A%0A`;
    message += `Please contact me soon. Thank you!`;

    // Put your WhatsApp number here - without +
    let whatsappNumber = `923124974060`; 
    
    let url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}
});

renderProducts();
updateCart();
