/**
 * Storefront page logic: loads categories + products from the API, and wires
 * up search, category chips, price filter, sort, and pagination.
 */
(function () {
  const state = {
    search: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
    page: 1,
    limit: 12,
  };

  const grid = document.getElementById('productGrid');
  const chipsRow = document.getElementById('categoryChips');
  const resultsCount = document.getElementById('resultsCount');
  const pagination = document.getElementById('pagination');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect');
  const minPriceInput = document.getElementById('minPrice');
  const maxPriceInput = document.getElementById('maxPrice');
  const applyPriceBtn = document.getElementById('applyPriceBtn');

  let searchDebounce;

  async function loadCategories() {
    try {
      const categories = await api.getCategories();
      categories.forEach((cat) => {
        const chip = document.createElement('button');
        chip.className = 'chip';
        chip.type = 'button';
        chip.dataset.category = cat;
        chip.textContent = cat;
        chipsRow.appendChild(chip);
      });
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  function productCard(product) {
    const lowStock = product.stock > 0 && product.stock <= 5;
    const outOfStock = product.stock === 0;
    return `
      <article class="product-card">
        <a href="product.html?id=${product._id}" class="product-card__image">
          <img src="${product.imageUrl}" alt="${product.name}" loading="lazy" />
        </a>
        <div class="product-card__body">
          <span class="product-card__category">${product.category}</span>
          <a href="product.html?id=${product._id}">
            <h3 class="product-card__name">${product.name}</h3>
          </a>
          <div class="product-card__footer">
            <span class="product-card__price">${formatPrice(product.price)}</span>
            <span class="badge-stock ${outOfStock ? 'low' : lowStock ? 'low' : ''}">
              ${outOfStock ? 'Out of stock' : lowStock ? `Only ${product.stock} left` : 'In stock'}
            </span>
          </div>
          <button class="btn btn-primary add-to-cart" data-id="${product._id}" ${outOfStock ? 'disabled' : ''} type="button">
            ${outOfStock ? 'Unavailable' : 'Add to cart'}
          </button>
        </div>
      </article>`;
  }

  function renderProducts(items) {
    if (items.length === 0) {
      grid.innerHTML = `
        <div class="state-message">
          <span class="emoji">🔍</span>
          No products match your filters.<br />Try a different search or category.
        </div>`;
      return;
    }
    grid.innerHTML = items.map(productCard).join('');

    grid.querySelectorAll('.add-to-cart').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        try {
          const product = await api.getProduct(id);
          Cart.add(product, 1);
          showToast(`${product.name} added to cart`);
        } catch (err) {
          showToast(err.message, true);
        }
      });
    });
  }

  function renderPagination(data) {
    if (data.totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    pagination.innerHTML = `
      <button id="prevPage" type="button" ${data.page <= 1 ? 'disabled' : ''}>← Prev</button>
      <span>Page ${data.page} of ${data.totalPages}</span>
      <button id="nextPage" type="button" ${data.page >= data.totalPages ? 'disabled' : ''}>Next →</button>
    `;
    document.getElementById('prevPage')?.addEventListener('click', () => {
      state.page = Math.max(1, state.page - 1);
      fetchAndRender();
    });
    document.getElementById('nextPage')?.addEventListener('click', () => {
      state.page += 1;
      fetchAndRender();
    });
  }

  async function fetchAndRender() {
    grid.innerHTML = '<div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div>';
    try {
      const data = await api.getProducts({
        search: state.search,
        category: state.category,
        minPrice: state.minPrice,
        maxPrice: state.maxPrice,
        sort: state.sort,
        page: state.page,
        limit: state.limit,
      });
      renderProducts(data.items);
      renderPagination(data);
      resultsCount.textContent = `${data.total} product${data.total === 1 ? '' : 's'}`;
    } catch (err) {
      grid.innerHTML = `
        <div class="state-message">
          <span class="emoji">⚠️</span>
          Could not load products.<br />${err.message}
        </div>`;
      resultsCount.textContent = '';
    }
  }

  // --- Event wiring ---
  searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      state.search = searchInput.value.trim();
      state.page = 1;
      fetchAndRender();
    }, 350);
  });

  chipsRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    chipsRow.querySelectorAll('.chip').forEach((c) => c.classList.remove('active'));
    chip.classList.add('active');
    state.category = chip.dataset.category;
    state.page = 1;
    fetchAndRender();
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.page = 1;
    fetchAndRender();
  });

  applyPriceBtn.addEventListener('click', () => {
    state.minPrice = minPriceInput.value;
    state.maxPrice = maxPriceInput.value;
    state.page = 1;
    fetchAndRender();
  });

  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (Cart.count() === 0) {
      showToast('Your cart is empty', true);
      return;
    }
    // "Lite" demo checkout - a real app would go to a payment flow here.
    showToast('Checkout is a demo in this lite build 🎉');
  });

  // --- Init ---
  const urlParams = new URLSearchParams(window.location.search);
  const initialSearch = urlParams.get('search');
  if (initialSearch) {
    state.search = initialSearch;
    searchInput.value = initialSearch;
  }

  wireCartDrawer();
  loadCategories();
  fetchAndRender();
})();
