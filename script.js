document.addEventListener("DOMContentLoaded", () => {
  
  // ================= 1. Мобільне меню (Burger) =================
  const burgerMenu = document.getElementById('burger-menu');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  burgerMenu.addEventListener('click', () => {
    burgerMenu.classList.toggle('active');
    mainNav.classList.toggle('active');
  });

  // Закривати меню при кліку на посилання
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerMenu.classList.remove('active');
      mainNav.classList.remove('active');
    });
  });

  // ================= 2. Плавний скрол =================
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        // Враховуємо висоту фіксованої шапки
        const headerHeight = document.querySelector('.site-header').offsetHeight;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ================= 3. Акордеон для FAQ =================
  const accordionItems = document.querySelectorAll('.accordion-item');

  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    
    header.addEventListener('click', () => {
      // Закриваємо інші відкриті вкладки (опціонально)
      accordionItems.forEach(otherItem => {
        if (otherItem !== item && otherItem.classList.contains('active')) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.accordion-content').style.maxHeight = null;
        }
      });

      // Перемикаємо поточну вкладку
      item.classList.toggle('active');
      const content = item.querySelector('.accordion-content');
      
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + "px";
      } else {
        content.style.maxHeight = null;
      }
    });
  });

  // ================= 4. Логіка Модального вікна (Попапу) =================
  const modalOverlay = document.getElementById('order-modal');
  const openModalBtns = document.querySelectorAll('.js-open-modal');
  const closeModalBtn = document.querySelector('.js-close-modal');
  const userCommentInput = document.getElementById('user-comment');
  const orderForm = document.getElementById('order-form');
  const formMessage = document.getElementById('form-message');

  function openModal(productName) {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокуємо скрол сторінки
    
    // Підставляємо назву товару або джерело кліку у поле коментаря
    if (productName) {
      userCommentInput.value = `Цікавить: ${productName}. \n\n`;
    } else {
      userCommentInput.value = '';
    }
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Очищаємо повідомлення після закриття
    setTimeout(() => {
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }, 300);
  }

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const product = btn.getAttribute('data-product');
      openModal(product);
    });
  });

  closeModalBtn.addEventListener('click', closeModal);

  // Закриття по кліку поза модальним вікном (на overlay)
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Закриття по клавіші Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // ================= 5. Відправка форми =================
  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Запобігаємо стандартному перезавантаженню

    const submitBtn = orderForm.querySelector('.submit-btn');
    submitBtn.textContent = 'Відправка...';
    submitBtn.disabled = true;

    // Збираємо дані
    const formData = new FormData(orderForm);
    const data = Object.fromEntries(formData.entries());

    try {
      /* Тут має бути ваш реальний endpoint (наприклад, Formspree)
        const response = await fetch('https://formspree.io/f/YOUR_ID', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      */
      
      // Імітація затримки мережі для демо
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Імітація успішної відправки (response.ok)
      formMessage.textContent = 'Дякуємо! Ваша заявка прийнята. Ми скоро зв\'яжемося з вами.';
      formMessage.className = 'form-message success';
      orderForm.reset();
      
    } catch (error) {
      formMessage.textContent = 'Сталася помилка при відправці. Спробуйте пізніше.';
      formMessage.className = 'form-message error';
    } finally {
      submitBtn.textContent = 'Відправити заявку';
      submitBtn.disabled = false;
      
      // Автоматичне закриття вікна через 3 секунди після успішної відправки
      if (formMessage.classList.contains('success')) {
        setTimeout(closeModal, 3000);
      }
    }
  });

});
