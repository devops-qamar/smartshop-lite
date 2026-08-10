/**
 * Product detail page logic. Reads ?id= from the URL, fetches the product,
 * and renders it with a quantity selector and add-to-cart action.
 */
(function () {
  const root = document.getElementById('productDetailRoot');
  const breadcrumbName = document.getElementById('breadcrumbName');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  let currentQty = 1;

  function render(product) {
    breadcrumbName.textContent = product.name;
    document.title = `${product.name} — SmartShop Lite`;

    const outOfStock = product.stock === 0;

    root.innerHTML = `
      <div class="product-detail">
        <div class="product-detail__image">
          <img src="${product.imageUrl}" alt="${product.name}" />
        </div>
        <div>
          <span class="product-detail__category">${product.category}</span>
          <h1 class="product-detail__name">${product.name}</h1>
          <div class="product-detail__price">${formatPrice(product.price)}</div>
          <p class="product-detail__desc">${product.description}</p>
          <span class="badge-stock ${outOfStock ? 'low' : product.stock <= 5 ? 'low' : ''}">
            ${outOfStock ? 'Out of stock' : `${product.stock} in stock`}
          </span>
          <div class="detail-actions">
            <div class="qty-control" id="qtyControl">
              <button type="button" data-action="dec">−</button>
              <input type="text" id="qtyInput" value="1" readonly />
              <button type="button" data-action="inc">+</button>
            </div>
            <button class="btn btn-primary" id="addToCartBtn" ${outOfStock ? 'disabled' : ''} type="button">
              ${outOfStock ? 'Unavailable' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    `;

    const qtyInput = document.getElementById('qtyInput');
    document.getElementById('qtyControl').addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'inc') currentQty = Math.min(currentQty + 1, product.stock || 99);
      if (btn.dataset.action === 'dec') currentQty = Math.max(currentQty - 1, 1);
      qtyInput.value = currentQty;
    });

    document.getElementById('addToCartBtn')?.addEventListener('click', () => {
      Cart.add(product, currentQty);
      showToast(`${currentQty} × ${product.name} added to cart`);
      currentQty = 1;
      qtyInput.value = 1;
    });
  }

  async function init() {
    if (!id) {
      root.innerHTML = `<div class="state-message"><span class="emoji">⚠️</span>No product specified.</div>`;
      return;
    }
    try {
      const product = await api.getProduct(id);
      render(product);
    } catch (err) {
      root.innerHTML = `<div class="state-message"><span class="emoji">⚠️</span>${err.message}</div>`;
    }
  }

  // Simple search redirect from the shared nav bar back to the shop page
  document.getElementById('searchInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      window.location.href = `index.html?search=${encodeURIComponent(e.target.value)}`;
    }
  });

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (Cart.count() === 0) {
      showToast('Your cart is empty', true);
      return;
    }
    showToast('Checkout is a demo in this lite build 🎉');
  });

  wireCartDrawer();
  init();
})();
