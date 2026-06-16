document.addEventListener("DOMContentLoaded", () => {
  
  // 1. Анімації при скролі (Intersection Observer)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Анімація програється лише один раз
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-up').forEach(element => {
    observer.observe(element);
  });

  // 2. Мобільне меню
  const burgerMenu = document.getElementById('burger-menu');
  const mainNav = document.getElementById('main-nav');
  const navLinks = document.querySelectorAll('.nav-link');

  if (burgerMenu && mainNav) {
    burgerMenu.addEventListener('click', () => {
      burgerMenu.classList.toggle('active');
      mainNav.classList.toggle('active');
      document.body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        burgerMenu.classList.remove('active');
        mainNav.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }

  // 3. Акордеон (FAQ)
  const accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        accordionItems.forEach(i => i.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    }
  });

  // 4. Логіка Модального вікна
  const modalOverlay = document.getElementById('order-modal');
  const openModalBtns = document.querySelectorAll('.js-open-modal');
  const closeModalBtn = document.querySelector('.js-close-modal');
  const userCommentInput = document.getElementById('user-comment');
  const orderForm = document.getElementById('order-form');
  const formMessage = document.getElementById('form-message');

  const openModal = (productContext) => {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    if (productContext && userCommentInput) {
      userCommentInput.value = `Мене зацікавив виріб: "${productContext}". \nБажаю обговорити деталі реалізації схожого проекту.`;
    }
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (orderForm) orderForm.reset();
    if (formMessage) {
      formMessage.textContent = '';
      formMessage.className = 'form-message';
    }
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(btn.getAttribute('data-product'));
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
  });

  // 5. Відправка форми (та підготовка експорту даних у форматі CSV за потреби бекенду)
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = orderForm.querySelector('.submit-btn');
      submitBtn.textContent = 'Обробка запиту...';
      submitBtn.disabled = true;

      // Підготовка даних форми
      const formData = new FormData(orderForm);
      const data = Object.fromEntries(formData.entries());

      try {
        // Симуляція мережевої затримки
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Функція підготовки даних замовлень для збереження у форматі CSV (інтеграція)
        const csvString = `${data.name},${data.contact},${data.format},"${data.comment.replace(/\n/g, ' ')}"`;
        console.log("Дані замовлення готові для імпорту в CSV-форматі:", csvString);

        if (formMessage) {
          formMessage.textContent = 'Дякуємо! Ваша заявка прийнята. Представник компанії зв\'яжеться з вами найближчим часом.';
          formMessage.className = 'form-message success';
        }
        orderForm.reset();
        setTimeout(closeModal, 3500);

      } catch (err) {
        if (formMessage) {
          formMessage.textContent = 'Сталася помилка. Спробуйте пізніше.';
          formMessage.className = 'form-message error';
        }
      } finally {
        submitBtn.textContent = 'Відправити заявку';
        submitBtn.disabled = false;
      }
    });
    // ================= Калькулятор ціни =================
  window.calculatePrice = function() {
    const sizeSelect = document.getElementById('calc-size');
    const techniqueSelect = document.getElementById('calc-technique');
    const priceDisplay = document.getElementById('dynamic-price');

    if(sizeSelect && techniqueSelect && priceDisplay) {
      // Отримуємо значення з селектів
      const basePrice = parseFloat(sizeSelect.value); // Ціна за розмір
      const multiplier = parseFloat(techniqueSelect.value); // Коефіцієнт техніки
      
      // Рахуємо фінальну ціну
      const finalPrice = Math.round(basePrice * multiplier);
      
      // Виводимо ціну з пробілом тисяч (напр. 1 500)
      priceDisplay.textContent = finalPrice.toLocaleString('uk-UA');
    }
  };

  // Викликаємо функцію один раз при завантаженні сторінки, щоб ціна відобразилась коректно одразу
  calculatePrice();
  }
});
