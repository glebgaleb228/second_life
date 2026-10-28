document.addEventListener('DOMContentLoaded', () => {
  const cards = [...document.querySelectorAll('.product-card')];
  const categoryButtons = [...document.querySelectorAll('.category-btn')];
  const loadMore = document.getElementById('load-more-btn');
  const search = document.getElementById('catalog-search');
  const readStore = (key) => { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } };
  const wishlist = readStore('dl-wishlist');
  const cart = readStore('dl-cart');
  const save = () => { localStorage.setItem('dl-wishlist', JSON.stringify(wishlist)); localStorage.setItem('dl-cart', JSON.stringify(cart)); };
  let activeCategory = 'Усі речі';
  let showAll = false;
  const formatPrice = (value) => `${Number(value).toLocaleString('uk-UA')} ₴`;
  const details = (card) => ({
    id: card.dataset.id,
    title: card.querySelector('.product-title').textContent.trim(),
    category: card.querySelector('.product-category').textContent.trim(),
    price: Number(card.querySelector('.price').textContent.replace(/\D/g, '')),
    image: card.querySelector('.product-image').src,
    specs: card.dataset.specs || '',
    story: card.dataset.story || ''
  });
  const persistState = () => { save(); renderWishlist(); renderCart(); };

  // Restore saved favorites and cart, and keep product controls in sync.
  cards.forEach(card => {
    const item = details(card);
    const heart = card.querySelector('.wishlist-btn');
    if (wishlist.some(saved => saved.id === item.id)) { heart.classList.add('active'); heart.textContent = '💖'; }
    heart.addEventListener('click', event => {
      event.stopPropagation();
      const index = wishlist.findIndex(saved => saved.id === item.id);
      if (index < 0) { wishlist.push(item); heart.classList.add('active'); heart.textContent = '💖'; }
      else { wishlist.splice(index, 1); heart.classList.remove('active'); heart.textContent = '❤️'; }
      persistState();
    });
    card.querySelector('.add-to-cart-btn').addEventListener('click', event => {
      event.stopPropagation();
      cart.push(item);
      persistState();
      document.getElementById('cart-modal').classList.add('open');
    });
    card.addEventListener('click', event => {
      if (event.target.closest('button')) return;
      const product = details(card);
      document.getElementById('detail-img').src = product.image;
      document.getElementById('detail-img').alt = product.title;
      document.getElementById('detail-category').textContent = product.category;
      document.getElementById('detail-title').textContent = product.title;
      document.getElementById('detail-price').textContent = formatPrice(product.price);
      document.getElementById('detail-specs').textContent = product.specs;
      document.getElementById('detail-story').textContent = product.story;
      document.getElementById('product-detail-modal').classList.add('open');
    });
  });

  const renderWishlist = () => {
    const container = document.getElementById('wishlist-items-container');
    document.getElementById('wishlist-counter').textContent = wishlist.length;
    document.getElementById('modal-counter').textContent = wishlist.length;
    container.innerHTML = wishlist.length ? wishlist.map(item => `<div class="wishlist-modal-item" data-id="${item.id}"><div class="wishlist-item-left"><img src="${item.image}" alt="" class="wishlist-item-img"><div><h4 class="wishlist-item-title"></h4><span class="wishlist-item-price">${formatPrice(item.price)}</span></div></div><button class="remove-wishlist-item" aria-label="Видалити з обраного">×</button></div>`).join('') : '<p class="empty-wishlist-text">У вас поки немає обраних речей 💔</p>';
    wishlist.forEach((item, index) => { const row = container.children[index]; row.querySelector('.wishlist-item-title').textContent = item.title; });
    container.querySelectorAll('.remove-wishlist-item').forEach(button => button.addEventListener('click', () => {
      const id = button.closest('.wishlist-modal-item').dataset.id;
      const index = wishlist.findIndex(item => item.id === id); if (index >= 0) wishlist.splice(index, 1);
      const heart = document.querySelector(`.product-card[data-id="${id}"] .wishlist-btn`);
      if (heart) { heart.classList.remove('active'); heart.textContent = '❤️'; }
      persistState();
    }));
  };
  const renderCart = () => {
    const container = document.getElementById('cart-items-container');
    document.getElementById('cart-counter').textContent = cart.length;
    document.getElementById('cart-modal-counter').textContent = cart.length;
    document.getElementById('cart-footer').style.display = cart.length ? 'block' : 'none';
    container.innerHTML = cart.length ? cart.map((item, index) => `<div class="wishlist-modal-item" data-index="${index}"><div class="wishlist-item-left"><img src="${item.image}" alt="" class="wishlist-item-img"><div><h4 class="wishlist-item-title"></h4><span class="wishlist-item-price">${formatPrice(item.price)}</span></div></div><button class="remove-cart-item" aria-label="Видалити з кошика">×</button></div>`).join('') : '<p class="empty-wishlist-text">Ваш кошик порожній 🛍️</p>';
    cart.forEach((item, index) => { container.children[index].querySelector('.wishlist-item-title').textContent = item.title; });
    document.getElementById('cart-total-price').textContent = formatPrice(cart.reduce((sum, item) => sum + Number(item.price), 0));
    container.querySelectorAll('.remove-cart-item').forEach(button => button.addEventListener('click', () => { cart.splice(Number(button.closest('.wishlist-modal-item').dataset.index), 1); persistState(); }));
  };
  const filterCards = () => {
    const query = (search?.value || '').trim().toLocaleLowerCase('uk');
    cards.forEach((card, index) => {
      const categoryMatch = activeCategory === 'Усі речі' || card.dataset.category === activeCategory;
      const searchMatch = !query || card.textContent.toLocaleLowerCase('uk').includes(query);
      const visible = categoryMatch && searchMatch && (showAll || index < 6 || activeCategory !== 'Усі речі' || query);
      card.classList.toggle('filtered-out', !visible);
      card.classList.toggle('show-card', visible && index >= 6);
    });
    if (loadMore) loadMore.hidden = showAll || Boolean(query) || activeCategory !== 'Усі речі';
  };
  categoryButtons.forEach(button => button.addEventListener('click', () => {
    categoryButtons.forEach(item => { item.classList.remove('active'); item.setAttribute('aria-pressed', 'false'); });
    button.classList.add('active'); button.setAttribute('aria-pressed', 'true');
    activeCategory = button.textContent.trim(); filterCards();
  }));
  search?.addEventListener('input', filterCards);
  loadMore?.addEventListener('click', () => { showAll = true; filterCards(); });

  const modalIds = ['wishlist-modal', 'cart-modal', 'product-detail-modal'];
  const closeAll = () => modalIds.forEach(id => document.getElementById(id).classList.remove('open'));
  document.getElementById('wishlist-modal-btn').addEventListener('click', () => document.getElementById('wishlist-modal').classList.add('open'));
  document.getElementById('cart-modal-btn').addEventListener('click', () => document.getElementById('cart-modal').classList.add('open'));
  document.getElementById('close-modal-btn').addEventListener('click', closeAll);
  document.getElementById('close-cart-modal-btn').addEventListener('click', closeAll);
  document.getElementById('close-product-modal').addEventListener('click', closeAll);
  modalIds.forEach(id => document.getElementById(id).addEventListener('click', event => { if (event.target.id === id) closeAll(); }));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeAll(); });
  document.getElementById('order-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = document.getElementById('buyer-name').value.trim();
    const item = document.getElementById('detail-title').textContent;
    alert(`Дякуємо, ${name}! Ми зателефонуємо, щоб підтвердити замовлення «${item}».`);
    event.currentTarget.reset(); closeAll();
  });
  renderWishlist(); renderCart(); filterCards();
});
