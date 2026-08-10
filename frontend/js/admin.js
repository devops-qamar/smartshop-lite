/**
 * Admin page logic: lists products in a table and provides a form to
 * create/update/delete them. Write requests are authorized with the
 * "x-admin-key" header, entered by the operator into the key box and
 * remembered in localStorage for convenience.
 */
(function () {
  const ADMIN_KEY_STORAGE = 'smartshop_admin_key';

  const state = { page: 1, limit: 10, editingId: null };

  const form = document.getElementById('productForm');
  const tableBody = document.getElementById('productTableBody');
  const adminPagination = document.getElementById('adminPagination');
  const formTitle = document.getElementById('formTitle');
  const saveBtn = document.getElementById('saveBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  const adminKeyInput = document.getElementById('adminKeyInput');
  const categoryList = document.getElementById('categoryList');

  const fields = {
    id: document.getElementById('productId'),
    name: document.getElementById('name'),
    description: document.getElementById('description'),
    price: document.getElementById('price'),
    stock: document.getElementById('stock'),
    category: document.getElementById('category'),
    imageUrl: document.getElementById('imageUrl'),
    featured: document.getElementById('featured'),
  };

  // Restore remembered admin key
  adminKeyInput.value = localStorage.getItem(ADMIN_KEY_STORAGE) || '';
  adminKeyInput.addEventListener('change', () => {
    localStorage.setItem(ADMIN_KEY_STORAGE, adminKeyInput.value);
  });

  function getAdminKey() {
    return adminKeyInput.value.trim();
  }

  async function loadCategoryOptions() {
    try {
      const categories = await api.getCategories();
      categoryList.innerHTML = categories.map((c) => `<option value="${c}"></option>`).join('');
    } catch (_) {
      /* non-critical */
    }
  }

  function resetForm() {
    form.reset();
    fields.id.value = '';
    state.editingId = null;
    formTitle.textContent = 'Add a product';
    saveBtn.textContent = 'Save product';
    cancelEditBtn.style.display = 'none';
  }

  function fillForm(product) {
    fields.id.value = product._id;
    fields.name.value = product.name;
    fields.description.value = product.description;
    fields.price.value = product.price;
    fields.stock.value = product.stock;
    fields.category.value = product.category;
    fields.imageUrl.value = product.imageUrl || '';
    fields.featured.checked = !!product.featured;
    state.editingId = product._id;
    formTitle.textContent = `Editing "${product.name}"`;
    saveBtn.textContent = 'Update product';
    cancelEditBtn.style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function tableRow(product) {
    return `
      <tr data-id="${product._id}">
        <td><img src="${product.imageUrl}" alt="${product.name}" /></td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${formatPrice(product.price)}</td>
        <td>${product.stock}</td>
        <td class="actions">
          <button class="table-btn edit" data-action="edit" type="button">Edit</button>
          <button class="table-btn delete" data-action="delete" type="button">Delete</button>
        </td>
      </tr>`;
  }

  function renderPagination(data) {
    if (data.totalPages <= 1) {
      adminPagination.innerHTML = '';
      return;
    }
    adminPagination.innerHTML = `
      <button id="adminPrev" type="button" ${data.page <= 1 ? 'disabled' : ''}>← Prev</button>
      <span>Page ${data.page} of ${data.totalPages}</span>
      <button id="adminNext" type="button" ${data.page >= data.totalPages ? 'disabled' : ''}>Next →</button>
    `;
    document.getElementById('adminPrev')?.addEventListener('click', () => {
      state.page = Math.max(1, state.page - 1);
      loadProducts();
    });
    document.getElementById('adminNext')?.addEventListener('click', () => {
      state.page += 1;
      loadProducts();
    });
  }

  async function loadProducts() {
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">Loading products...</td></tr>`;
    try {
      const data = await api.getProducts({ page: state.page, limit: state.limit, sort: 'newest' });
      if (data.items.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;">No products yet. Add your first one!</td></tr>`;
      } else {
        tableBody.innerHTML = data.items.map(tableRow).join('');
      }
      renderPagination(data);
    } catch (err) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--color-danger);">${err.message}</td></tr>`;
    }
  }

  tableBody.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const row = btn.closest('tr');
    const id = row.dataset.id;

    if (btn.dataset.action === 'edit') {
      try {
        const product = await api.getProduct(id);
        fillForm(product);
      } catch (err) {
        showToast(err.message, true);
      }
    }

    if (btn.dataset.action === 'delete') {
      if (!getAdminKey()) {
        showToast('Enter the admin key first', true);
        return;
      }
      if (!confirm('Delete this product? This cannot be undone.')) return;
      try {
        await api.deleteProduct(id, getAdminKey());
        showToast('Product deleted');
        if (state.editingId === id) resetForm();
        loadProducts();
      } catch (err) {
        showToast(err.message, true);
      }
    }
  });

  cancelEditBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!getAdminKey()) {
      showToast('Enter the admin key first', true);
      return;
    }

    const payload = {
      name: fields.name.value.trim(),
      description: fields.description.value.trim(),
      price: parseFloat(fields.price.value),
      stock: parseInt(fields.stock.value, 10),
      category: fields.category.value.trim(),
      imageUrl: fields.imageUrl.value.trim() || undefined,
      featured: fields.featured.checked,
    };

    saveBtn.disabled = true;
    try {
      if (state.editingId) {
        await api.updateProduct(state.editingId, payload, getAdminKey());
        showToast('Product updated');
      } else {
        await api.createProduct(payload, getAdminKey());
        showToast('Product added');
      }
      resetForm();
      loadCategoryOptions();
      loadProducts();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  });

  // --- Init ---
  loadCategoryOptions();
  loadProducts();
})();
