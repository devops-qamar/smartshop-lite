/**
 * Shared shopping cart, persisted to localStorage so it survives across pages
 * and reloads. Exposes a small `Cart` API used by every page, plus the
 * cart-drawer UI wiring (open/close, render, quantity changes).
 */
const CART_STORAGE_KEY = 'smartshop_cart_v1';

const Cart = {
  read() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  },

  write(items) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    document.dispatchEvent(new CustomEvent('cart:changed', { detail: items }));
  },

  add(product, qty = 1) {
    const items = Cart.read();
    const existing = items.find((i) => i.id === product._id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({
        id: product._id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        qty,
      });
    }
    Cart.write(items);
  },

  setQty(id, qty) {
    let items = Cart.read();
    if (qty <= 0) {
      items = items.filter((i) => i.id !== id);
    } else {
      const item = items.find((i) => i.id === id);
      if (item) item.qty = qty;
    }
    Cart.write(items);
  },

  remove(id) {
    const items = Cart.read().filter((i) => i.id !== id);
    Cart.write(items);
  },

  clear() {
    Cart.write([]);
  },

  count() {
    return Cart.read().reduce((sum, i) => sum + i.qty, 0);
  },

  subtotal() {
    return Cart.read().reduce((sum, i) => sum + i.qty * i.price, 0);
  },
};

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

/* ---------------------------------------------------------------------- */
/* Cart drawer UI - relies on markup injected by injectSharedLayout()      */
/* ---------------------------------------------------------------------- */
function renderCartDrawer() {
  const itemsEl = document.getElementById('cartItems');
  const subtotalEl = document.getElementById('cartSubtotal');
  const countEls = document.querySelectorAll('.cart-count');
  const items = Cart.read();

  countEls.forEach((el) => {
    el.textContent = Cart.count();
  });

  if (!itemsEl) return;

  if (items.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <span class="emoji" style="font-size:2rem;display:block;margin-bottom:8px;">🛒</span>
        Your cart is empty.<br />Add something you like!
      </div>`;
  } else {
    itemsEl.innerHTML = items
      .map(
        (item) => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.imageUrl}" alt="${item.name}" />
          <div class="cart-item__info">
            <div class="cart-item__name">${item.name}</div>
            <div class="cart-item__price">${formatPrice(item.price)} each</div>
            <div class="cart-item__controls">
              <div class="qty-control small">
                <button type="button" data-action="dec">−</button>
                <input type="text" value="${item.qty}" readonly />
                <button type="button" data-action="inc">+</button>
              </div>
              <button type="button" class="cart-item__remove" data-action="remove">Remove</button>
            </div>
          </div>
        </div>`
      )
      .join('');
  }

  if (subtotalEl) {
    subtotalEl.textContent = formatPrice(Cart.subtotal());
  }
}

function openCartDrawer() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  renderCartDrawer();
}

function closeCartDrawer() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
}

function wireCartDrawer() {
  document.querySelectorAll('[data-open-cart]').forEach((btn) => {
    btn.addEventListener('click', openCartDrawer);
  });
  document.getElementById('cartClose')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartOverlay')?.addEventListener('click', closeCartDrawer);

  document.getElementById('cartItems')?.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('.cart-item');
    const id = row.dataset.id;
    const items = Cart.read();
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (btn.dataset.action === 'inc') Cart.setQty(id, item.qty + 1);
    if (btn.dataset.action === 'dec') Cart.setQty(id, item.qty - 1);
    if (btn.dataset.action === 'remove') Cart.remove(id);
  });

  document.addEventListener('cart:changed', renderCartDrawer);
  renderCartDrawer();
}

function showToast(message, isError = false) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2400);
}
