document.addEventListener('DOMContentLoaded', function() {
  // 1. Кнопка «Показати ще речі»
  const loadMoreBtn = document.getElementById('load-more-btn');
  const hiddenCards = document.querySelectorAll('.hidden-card');

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', function() {
      hiddenCards.forEach(card => {
        card.classList.remove('hidden-card');
        card.classList.add('show-card');
      });
      loadMoreBtn.style.display = 'none';
    });
  }

  // 2. Фільтрація за категоріями
  const categoryBtns = document.querySelectorAll('.category-btn');
  const allCards = document.querySelectorAll('.product-card');

  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const selectedCategory = this.textContent.trim();

      allCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (selectedCategory === 'Усі речі' || cardCategory === selectedCategory) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

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
          <div class="wishlist-item-left">
            <img src="${item.image}" alt="${item.title}" class="wishlist-item-img">
            <div>
              <h4 class="wishlist-item-title">${item.title}</h4>
              <span class="wishlist-item-price">${item.price}</span>
            </div>
          </div>
          <button class="remove-wishlist-item" title="Видалити">❌</button>
        </div>
      `;
    });

    wishlistContainer.innerHTML = html;

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

      // Автоматичне відкриття кошика при додаванні
      cartModal.classList.add('open');
    });
  });

  function updateCartUI() {
    cartCounter.textContent = cart.length;
    cartModalCounter.textContent = cart.length;

    if (cart.length === 0) {
      cartContainer.innerHTML = `<p class="empty-wishlist-text">Ваш кошик порожній 🛍️</p>`;
      cartFooter.style.display = 'none';
      return;
    }

    cartFooter.style.display = 'block';
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
    cartTotalPrice.textContent = total.toLocaleString() + ' ₴';

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


  // 5. Модальне вікно деталей товару та форма замовлення
  const productDetailModal = document.getElementById('product-detail-modal');
  const closeProductModal = document.getElementById('close-product-modal');
  const detailImg = document.getElementById('detail-img');
  const detailCategory = document.getElementById('detail-category');
  const detailTitle = document.getElementById('detail-title');
  const detailPrice = document.getElementById('detail-price');
  const detailSpecs = document.getElementById('detail-specs');
  const orderForm = document.getElementById('order-form');

  allCards.forEach(card => {
    card.addEventListener('click', function(e) {
      // Якщо клікнули на сердечко чи кнопку кошика — не відкриваємо деталі
      if (e.target.closest('.wishlist-btn') || e.target.closest('.add-to-cart-btn')) return;

      const title = card.querySelector('.product-title').textContent;
      const category = card.querySelector('.product-category').textContent;
      const price = card.querySelector('.price').textContent;
      const img = card.querySelector('.product-image').src;
      const specs = card.getAttribute('data-specs');

      detailImg.src = img;
      detailCategory.textContent = category;
      detailTitle.textContent = title;
      detailPrice.textContent = price;
      detailSpecs.textContent = specs;

      productDetailModal.classList.add('open');
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