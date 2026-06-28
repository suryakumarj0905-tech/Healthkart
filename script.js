/* =====================================================================
   MEDICARE+ ONLINE PHARMACY
   Shared script used by home.html, medicines.html and Uploadrx.html

   Sections:
   1. Mobile navigation toggle
   2. Shopping cart (stored in localStorage so it survives page changes)
   3. Search + category filter tags (medicines.html only)
   4. Prescription upload form (Uploadrx.html only)

   Every section checks first whether its HTML elements exist on the
   current page, so this one file can safely be linked from all pages.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ------------------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     ------------------------------------------------------------------ */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('show');
    });
  }

  /* ------------------------------------------------------------------
     2. SHOPPING CART
     ------------------------------------------------------------------ */
  var CART_KEY = 'medicarePlusCart';

  // Read the cart array from localStorage (or start with an empty cart)
  function getCart() {
    var saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  }

  // Save the cart array back to localStorage
  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }

  // Update the small number badge on the cart icon (every page)
  function updateCartBadge() {
    var cart = getCart();
    var totalQty = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    var badge = document.getElementById('cartCount');
    if (badge) {
      badge.textContent = totalQty;
    }
  }

  // Add an item to the cart (or increase its quantity if already added)
  function addToCart(name, price) {
    var cart = getCart();
    var existing = cart.find(function (item) { return item.name === name; });

    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name: name, price: price, qty: 1 });
    }

    saveCart(cart);
    updateCartBadge();
    showToast(name + ' added to cart');
  }

  // Change the quantity of an item already in the cart
  function changeQty(name, change) {
    var cart = getCart();
    var item = cart.find(function (i) { return i.name === name; });
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
      cart = cart.filter(function (i) { return i.name !== name; });
    }

    saveCart(cart);
    updateCartBadge();
    renderCart();
  }

  // Remove an item from the cart completely
  function removeFromCart(name) {
    var cart = getCart().filter(function (item) { return item.name !== name; });
    saveCart(cart);
    updateCartBadge();
    renderCart();
  }

  // Draw the cart items inside the cart drawer
  function renderCart() {
    var cartItemsEl = document.getElementById('cartItems');
    var cartTotalEl = document.getElementById('cartTotal');
    var checkoutBtn = document.getElementById('checkoutBtn');
    if (!cartItemsEl) return; // drawer markup not on this page

    var cart = getCart();
    cartItemsEl.innerHTML = '';

    if (cart.length === 0) {
      cartItemsEl.innerHTML = '<p class="cart-empty-msg">Your cart is empty. Browse medicines and add a few items.</p>';
      if (cartTotalEl) cartTotalEl.textContent = 'Rs.0';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    var total = 0;

    cart.forEach(function (item) {
      total += item.price * item.qty;

      var row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-item-info">' +
          '<h5>' + item.name + '</h5>' +
          '<span>Rs.' + item.price + ' x ' + item.qty + '</span>' +
        '</div>' +
        '<div class="cart-item-controls">' +
          '<button class="qty-btn" data-action="decrease" data-name="' + item.name + '">-</button>' +
          '<span>' + item.qty + '</span>' +
          '<button class="qty-btn" data-action="increase" data-name="' + item.name + '">+</button>' +
          '<button class="cart-item-remove" data-action="remove" data-name="' + item.name + '">Remove</button>' +
        '</div>';

      cartItemsEl.appendChild(row);
    });

    if (cartTotalEl) cartTotalEl.textContent = 'Rs.' + total;
    if (checkoutBtn) checkoutBtn.disabled = false;
  }

  // Buttons inside the cart drawer are created dynamically, so we
  // listen on the container itself (event delegation)
  var cartItemsContainer = document.getElementById('cartItems');
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', function (e) {
      var btn = e.target.closest('button');
      if (!btn) return;

      var name = btn.getAttribute('data-name');
      var action = btn.getAttribute('data-action');

      if (action === 'increase') changeQty(name, 1);
      if (action === 'decrease') changeQty(name, -1);
      if (action === 'remove') removeFromCart(name);
    });
  }

  // Open / close the cart drawer
  var cartToggle = document.getElementById('cartToggle');
  var cartDrawer = document.getElementById('cartDrawer');
  var cartOverlay = document.getElementById('cartOverlay');
  var cartClose = document.getElementById('cartClose');

  function openCart() {
    renderCart();
    if (cartDrawer) cartDrawer.classList.add('open');
    if (cartOverlay) cartOverlay.classList.add('open');
  }

  function closeCart() {
    if (cartDrawer) cartDrawer.classList.remove('open');
    if (cartOverlay) cartOverlay.classList.remove('open');
  }

  if (cartToggle) cartToggle.addEventListener('click', openCart);
  if (cartClose) cartClose.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Checkout button: this is a front-end student project, so there is
  // no payment gateway, we simply confirm the order and clear the cart
  var checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function () {
      saveCart([]);
      updateCartBadge();
      renderCart();
      showToast('Order placed! Our pharmacist will verify any prescription items.');
      closeCart();
    });
  }

  // "Add" buttons on every medicine card (works on home.html and medicines.html)
  var addButtons = document.querySelectorAll('.add-btn');
  addButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var name = button.getAttribute('data-name');
      var price = parseFloat(button.getAttribute('data-price'));
      addToCart(name, price);

      // Quick visual confirmation on the button itself
      button.innerHTML = '&#10003;';
      setTimeout(function () {
        button.innerHTML = '+';
      }, 1200);
    });
  });

  // Small toast message shown at the bottom of the screen
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 2200);
  }

  // Always keep the badge correct when any page first loads
  updateCartBadge();

  /* ------------------------------------------------------------------
     3. SEARCH + CATEGORY FILTER TAGS (medicines.html only)
     ------------------------------------------------------------------ */
  var tags = document.querySelectorAll('.tag');
  var productCards = document.querySelectorAll('.product-card');
  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var noResultsMsg = document.getElementById('noResults');

  function applyFilters() {
    if (productCards.length === 0) return;

    var activeTag = document.querySelector('.tag.active');
    var category = activeTag ? activeTag.getAttribute('data-category') : 'all';
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
    var visibleCount = 0;

    productCards.forEach(function (card) {
      var cardCategory = card.getAttribute('data-category') || '';
      var cardName = card.getAttribute('data-name').toLowerCase();

      var matchesCategory = (category === 'all') || cardCategory.indexOf(category) !== -1;
      var matchesSearch = keyword === '' || cardName.indexOf(keyword) !== -1;

      if (matchesCategory && matchesSearch) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (noResultsMsg) {
      noResultsMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  if (tags.length > 0) {
    tags.forEach(function (tag) {
      tag.addEventListener('click', function () {
        tags.forEach(function (t) { t.classList.remove('active'); });
        tag.classList.add('active');
        applyFilters();
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', function (e) {
      e.preventDefault();
      applyFilters();
    });
  }

  /* ------------------------------------------------------------------
     4. PRESCRIPTION UPLOAD FORM (Uploadrx.html only)
     ------------------------------------------------------------------ */
  var uploadBox = document.getElementById('uploadBox');
  var fileInput = document.getElementById('rxFile');
  var rxForm = document.getElementById('rxForm');

  if (uploadBox && fileInput) {
    // Clicking the styled box opens the real (hidden) file picker
    uploadBox.addEventListener('click', function () {
      fileInput.click();
    });

    fileInput.addEventListener('change', function () {
      if (fileInput.files.length > 0) {
        var fileName = fileInput.files[0].name;
        uploadBox.classList.add('has-file');
        uploadBox.innerHTML = '&#128206; ' + fileName + '<br><small>Click to change file</small>';
      }
    });
  }

  if (rxForm) {
    rxForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var isValid = true;

      // Simple required-field checks, each with its own inline error message
      var fields = ['rxName', 'rxPhone', 'rxAddress'];
      fields.forEach(function (id) {
        var field = document.getElementById(id);
        var error = document.getElementById(id + 'Error');
        if (!field.value.trim()) {
          field.classList.add('input-error');
          if (error) error.style.display = 'block';
          isValid = false;
        } else {
          field.classList.remove('input-error');
          if (error) error.style.display = 'none';
        }
      });

      var fileError = document.getElementById('rxFileError');
      if (fileInput.files.length === 0) {
        if (fileError) fileError.style.display = 'block';
        isValid = false;
      } else if (fileError) {
        fileError.style.display = 'none';
      }

      if (!isValid) return;

      // No backend in this student project: show an on-page confirmation
      // instead of actually sending the file anywhere
      var orderId = 'MC' + Math.floor(100000 + Math.random() * 900000);
      var orderIdEl = document.getElementById('orderId');
      if (orderIdEl) orderIdEl.textContent = orderId;

      rxForm.style.display = 'none';
      var successEl = document.getElementById('rxSuccess');
      if (successEl) successEl.style.display = 'block';
    });
  }

});
