document.addEventListener('DOMContentLoaded', function() {
  // 1. Категорії та кнопка розгортання каталогу
  const loadMoreBtn = document.getElementById('load-more-btn');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const allCards = document.querySelectorAll('.product-card');
  const catalogSearch = document.getElementById('catalog-search');
  const catalogEmptyState = document.getElementById('catalog-empty-state');
  const catalog = document.getElementById('catalog');
  let selectedCategory = 'Усі речі';
  let showAllCards = false;

  function renderCatalog() {
    const query = catalogSearch?.value.trim().toLocaleLowerCase('uk-UA') || '';
    let visibleCount = 0;

    allCards.forEach((card, index) => {
      const matchesCategory = selectedCategory === 'Усі речі' || card.dataset.category.trim() === selectedCategory;
      const searchableText = [card.textContent, card.dataset.specs, card.dataset.story].join(' ').toLocaleLowerCase('uk-UA');
      const matchesSearch = !query || searchableText.includes(query);
      const withinInitialBatch = showAllCards || selectedCategory !== 'Усі речі' || Boolean(query) || index < 6;
      const visible = matchesCategory && matchesSearch && withinInitialBatch;
      card.classList.remove('hidden-card', 'show-card');
      card.classList.toggle('filtered-out', !visible);
      if (visible) visibleCount += 1;
    });

    if (catalogEmptyState) catalogEmptyState.hidden = visibleCount > 0;
    if (loadMoreBtn) {
      loadMoreBtn.hidden = selectedCategory !== 'Усі речі' || showAllCards || Boolean(query);
    }
  }

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryBtns.forEach(categoryBtn => categoryBtn.classList.remove('active'));
      this.classList.add('active');
      selectedCategory = this.textContent.trim();
      renderCatalog();
    });
  });

  catalogSearch?.addEventListener('input', renderCatalog);
  catalogSearch?.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      catalog?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      showAllCards = true;
      renderCatalog();
    });
  }
  renderCatalog();

  // Interactive before/after comparison in the hero CTA destination.
  const comparisonFrame = document.querySelector('[data-before-after]');
  const comparisonRange = comparisonFrame?.querySelector('.before-after-range');
  if (comparisonFrame && comparisonRange) {
    const updateComparison = () => comparisonFrame.style.setProperty('--split', `${comparisonRange.value}%`);
    comparisonRange.addEventListener('input', updateComparison);
    updateComparison();
  }

  // 3. Обране (Wishlist)
  const wishlistButtons = document.querySelectorAll('.wishlist-btn');
  const wishlistModalBtn = document.getElementById('wishlist-modal-btn');
  const wishlistModal = document.getElementById('wishlist-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const wishlistContainer = document.getElementById('wishlist-items-container');
  const wishlistCounter = document.getElementById('wishlist-counter');
  const modalCounter = document.getElementById('modal-counter');

  let wishlist = [];

  wishlistButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation(); // Щоб не відкривалось модальне вікно товару
      this.classList.toggle('active');

      const card = this.closest('.product-card');
      const productId = card.getAttribute('data-id');
      const productTitle = card.querySelector('.product-title').textContent;
      const productPrice = card.querySelector('.price').textContent;
      const productImage = card.querySelector('.product-image').src;

      if (this.classList.contains('active')) {
        this.textContent = '💖';
        wishlist.push({ id: productId, title: productTitle, price: productPrice, image: productImage });
      } else {
        this.textContent = '❤️';
        wishlist = wishlist.filter(item => item.id !== productId);
      }

      updateWishlistUI();
    });
  });

  function updateWishlistUI() {
    wishlistCounter.textContent = wishlist.length;
    modalCounter.textContent = wishlist.length;

    if (wishlist.length === 0) {
      wishlistContainer.innerHTML = `<p class="empty-wishlist-text">У вас поки немає обраних речей 💔</p>`;
      return;
    }

    let html = '';
    wishlist.forEach(item => {
      html += `
        <div class="wishlist-modal-item" data-id="${item.id}">
          <button type="button" class="wishlist-item-open" aria-label="Відкрити картку товару: ${item.title}">
          <span class="wishlist-item-left">
            <img src="${item.image}" alt="${item.title}" class="wishlist-item-img">
            <span>
              <span class="wishlist-item-title">${item.title}</span>
              <span class="wishlist-item-price">${item.price}</span>
            </span>
          </span>
          </button>
          <button type="button" class="remove-wishlist-item" aria-label="Видалити з обраного">❌</button>
        </div>
      `;
    });

    wishlistContainer.innerHTML = html;

    wishlistContainer.querySelectorAll('.wishlist-item-open').forEach(openButton => {
      openButton.addEventListener('click', function() {
        const card = document.querySelector(`.product-card[data-id="${this.closest('.wishlist-modal-item').dataset.id}"]`);
        if (!card) return;
        wishlistModal.classList.remove('open');
        openProductDetails(card);
      });
    });

    wishlistContainer.querySelectorAll('.remove-wishlist-item').forEach(remBtn => {
      remBtn.addEventListener('click', function() {
        const itemElement = this.closest('.wishlist-modal-item');
        const idToRemove = itemElement.getAttribute('data-id');

        const cardToUncheck = document.querySelector(`.product-card[data-id="${idToRemove}"]`);
        if (cardToUncheck) {
          const heartBtn = cardToUncheck.querySelector('.wishlist-btn');
          heartBtn.classList.remove('active');
          heartBtn.textContent = '❤️';
        }

        wishlist = wishlist.filter(item => item.id !== idToRemove);
        updateWishlistUI();
      });
    });
  }

  wishlistModalBtn.addEventListener('click', (e) => { e.preventDefault(); wishlistModal.classList.add('open'); });
  closeModalBtn.addEventListener('click', () => wishlistModal.classList.remove('open'));
  wishlistModal.addEventListener('click', (e) => { if (e.target === wishlistModal) wishlistModal.classList.remove('open'); });


  // 4. Кошик покупок (Cart)
  const cartModalBtn = document.getElementById('cart-modal-btn');
  const cartModal = document.getElementById('cart-modal');
  const closeCartModalBtn = document.getElementById('close-cart-modal-btn');
  const cartContainer = document.getElementById('cart-items-container');
  const cartCounter = document.getElementById('cart-counter');
  const cartModalCounter = document.getElementById('cart-modal-counter');
  const cartFooter = document.getElementById('cart-footer');
  const cartTotalPrice = document.getElementById('cart-total-price');
  const checkoutToggle = document.getElementById('checkout-toggle');
  const checkoutForm = document.getElementById('checkout-form');
  const checkoutBack = document.getElementById('checkout-back');
  const checkoutSubmitTotal = document.getElementById('checkout-submit-total');
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

  let cart = [];

  addToCartButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      const card = this.closest('.product-card');
      const productId = card.getAttribute('data-id');
      const productTitle = card.querySelector('.product-title').textContent;
      const productPriceStr = card.querySelector('.price').textContent;
      const productImage = card.querySelector('.product-image').src;

      const priceNum = parseInt(productPriceStr.replace(/\D/g, ''));

      cart.push({ id: productId, title: productTitle, price: priceNum, image: productImage });
      updateCartUI();
    });
  });

  function updateCartUI() {
    cartCounter.textContent = cart.length;
    cartModalCounter.textContent = cart.length;

    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="empty-wishlist-text">Ваш кошик порожній 🛍️</p>`;
      cartFooter.hidden = true;
      checkoutForm.hidden = true;
      checkoutToggle.hidden = false;
      checkoutToggle.setAttribute('aria-expanded', 'false');
      return;
    }

    cartFooter.hidden = false;
    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price;
      html += `
        <div class="wishlist-modal-item" data-index="${index}">
          <div class="wishlist-item-left">
            <img src="${item.image}" alt="${item.title}" class="wishlist-item-img">
            <div>
              <h4 class="wishlist-item-title">${item.title}</h4>
              <span class="wishlist-item-price">${item.price.toLocaleString()} ₴</span>
            </div>
          </div>
          <button class="remove-cart-item" title="Видалити">❌</button>
        </div>
      `;
    });

    cartContainer.innerHTML = html;
    const formattedTotal = total.toLocaleString('uk-UA') + ' ₴';
    cartTotalPrice.textContent = formattedTotal;
    checkoutSubmitTotal.textContent = formattedTotal;

    cartContainer.querySelectorAll('.remove-cart-item').forEach((remBtn, idx) => {
      remBtn.addEventListener('click', function() {
        cart.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  cartModalBtn.addEventListener('click', (e) => { e.preventDefault(); cartModal.classList.add('open'); });
  closeCartModalBtn.addEventListener('click', () => cartModal.classList.remove('open'));
  cartModal.addEventListener('click', (e) => { if (e.target === cartModal) cartModal.classList.remove('open'); });
  checkoutToggle.addEventListener('click', () => {
    checkoutToggle.hidden = true;
    checkoutForm.hidden = false;
    checkoutToggle.setAttribute('aria-expanded', 'true');
    checkoutForm.querySelector('input[name="name"]').focus();
  });
  checkoutBack.addEventListener('click', () => {
    checkoutForm.hidden = true;
    checkoutToggle.hidden = false;
    checkoutToggle.setAttribute('aria-expanded', 'false');
  });
  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const name = checkoutForm.elements.name.value.trim();
    const total = cart.reduce((sum, item) => sum + item.price, 0).toLocaleString('uk-UA') + ' ₴';
    cart.length = 0;
    checkoutForm.reset();
    updateCartUI();
    cartContainer.innerHTML = '<div class="order-success" role="status"><span class="order-success-icon" aria-hidden="true">✓</span><h4></h4><p></p><button type="button" class="order-success-close">Продовжити покупки</button></div>';
    cartContainer.querySelector('h4').textContent = `Дякуємо, ${name}!`;
    cartContainer.querySelector('p').textContent = `Ваше замовлення на суму ${total} прийнято. Ми зателефонуємо, щоб підтвердити доставку.`;
    cartContainer.querySelector('.order-success-close').addEventListener('click', () => cartModal.classList.remove('open'));
  });


  // 5. Модальне вікно деталей товару та форма замовлення
  const productDetailModal = document.getElementById('product-detail-modal');
  const closeProductModal = document.getElementById('close-product-modal');
  const detailImg = document.getElementById('detail-img');
  const detailCategory = document.getElementById('detail-category');
  const detailTitle = document.getElementById('detail-title');
  const detailPrice = document.getElementById('detail-price');
  const detailSpecs = document.getElementById('detail-specs');
  const detailStory = document.getElementById('detail-story');
  const orderForm = document.getElementById('order-form');

  function openProductDetails(card) {
    const title = card.querySelector('.product-title').textContent;
    detailImg.src = card.querySelector('.product-image').src;
    detailCategory.textContent = card.querySelector('.product-category').textContent;
    detailTitle.textContent = title;
    detailPrice.textContent = card.querySelector('.price').textContent;
    detailSpecs.textContent = card.dataset.specs || '';
    if (detailStory) detailStory.textContent = card.dataset.story || '';
    productDetailModal.classList.add('open');
  }

  allCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Якщо клікнули на сердечко чи кнопку кошика — не відкриваємо деталі
      if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart-btn')) return;
      openProductDetails(card);
    });
  });

  closeProductModal.addEventListener('click', () => productDetailModal.classList.remove('open'));
  productDetailModal.addEventListener('click', (e) => { if (e.target === productDetailModal) productDetailModal.classList.remove('open'); });

  // Обробка форми замовлення
  orderForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('buyer-name').value;
    const phone = document.getElementById('buyer-phone').value;

    alert(`Дякуємо за замовлення, ${name}! Ми зателефонуємо на номер ${phone} для підтвердження деталі доставки.`);
    orderForm.reset();
    productDetailModal.classList.remove('open');
  });
});
