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
        observer.unobserve(entry.target);
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

  // 3. Акордеон (FAQ та Характеристики)
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

  const openModal = (productContext) => {
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      // Підставляємо назву виробу, якщо це клік з каталогу
      if (productContext && userCommentInput) {
        userCommentInput.value = `Мене зацікавив виріб: "${productContext}". \nБажаю обговорити деталі.`;
      }
    }
  };

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openModal(btn.getAttribute('data-product'));
    });
  });

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('active')) closeModal();
  });

  // 5. Відправка форми у Telegram-бот
  const TELEGRAM_TOKEN = '8833646323:AAGfXYN1cyAiPyrNfjtu9b_MSlWJKFnO0C8';
  const CHAT_ID = '8522043344';

  const sendToTelegram = async (form, messageElement, isContactForm = false) => {
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Відправка...';
    submitBtn.disabled = true;

    // Отримуємо дані з форми
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Формуємо повідомлення
    let text = `🌟 <b>Нова заявка з сайту!</b>\n\n`;
    text += `👤 <b>Ім'я:</b> ${data.name || 'Не вказано'}\n`;
    text += `📞 <b>Контакт:</b> ${data.contact || 'Не вказано'}\n`;
    
    if (data.format) text += `🧵 <b>Матеріал:</b> ${data.format}\n`;
    if (data.size) text += `📏 <b>Розмір:</b> ${data.size}\n`;
    if (data.comment) text += `📝 <b>Повідомлення/Коментар:</b>\n${data.comment}\n`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'HTML'
        })
      });

      if (response.ok) {
        if (messageElement) {
          messageElement.textContent = 'Дякуємо! Ваша заявка успішно відправлена. Майстриня зв\'яжеться з вами найближчим часом.';
          messageElement.className = 'form-message success';
        }
        form.reset();
        
        // Закриваємо модалку після відправки
        if (!isContactForm) {
          setTimeout(() => {
            closeModal();
            if (messageElement) {
              messageElement.textContent = '';
              messageElement.className = 'form-message';
            }
          }, 3000);
        }
      } else {
        throw new Error('Помилка API Telegram');
      }
    } catch (err) {
      console.error(err);
      if (messageElement) {
        messageElement.textContent = 'Сталася помилка при відправці. Будь ласка, зв\'яжіться напряму через месенджери.';
        messageElement.className = 'form-message error';
      }
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  };

  // Обробник форми у модальному вікні
  const orderForm = document.getElementById('order-form');
  const formMessage = document.getElementById('form-message');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendToTelegram(orderForm, formMessage, false);
    });
  }

  // Обробник форми на сторінці контактів (якщо вона є)
  const pageContactForm = document.getElementById('page-contact-form');
  const pageFormMessage = document.getElementById('page-form-message');
  if (pageContactForm) {
    pageContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendToTelegram(pageContactForm, pageFormMessage, true);
    });
  }

  // ================= Галерея на сторінці товару (product.html) =================
  window.changeImage = function(element) {
    const mainImg = document.getElementById('main-product-img');
    if(mainImg) {
      mainImg.src = element.src; 
      document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
      element.classList.add('active');
    }
  };

  // ================= Калькулятор ціни (product.html) =================
  window.calculatePrice = function() {
    const sizeSelect = document.getElementById('calc-size');
    const techniqueSelect = document.getElementById('calc-technique');
    const priceDisplay = document.getElementById('dynamic-price');

    if(sizeSelect && techniqueSelect && priceDisplay) {
      const basePrice = parseFloat(sizeSelect.value); 
      const multiplier = parseFloat(techniqueSelect.value); 
      
      const finalPrice = Math.round(basePrice * multiplier);
      priceDisplay.textContent = finalPrice.toLocaleString('uk-UA');
    }
  };

  // Ініціалізація калькулятора при завантаженні
  calculatePrice();

  // ================= Підстановка даних з калькулятора у форму (product.html) =================
  const customModalBtn = document.querySelector('.js-open-modal-custom');
  if(customModalBtn) {
    customModalBtn.addEventListener('click', () => {
      const title = document.querySelector('.product-title') ? document.querySelector('.product-title').textContent : 'Виріб';
      const sizeSelect = document.getElementById('calc-size');
      const techSelect = document.getElementById('calc-technique');
      const matSelect = document.getElementById('calc-material');
      const price = document.getElementById('dynamic-price') ? document.getElementById('dynamic-price').textContent : '';

      if (sizeSelect && techSelect && matSelect && userCommentInput) {
        const sizeText = sizeSelect.options[sizeSelect.selectedIndex].getAttribute('data-label');
        const techText = techSelect.options[techSelect.selectedIndex].getAttribute('data-label');
        const matText = matSelect.options[matSelect.selectedIndex].value;

        userCommentInput.value = `Мене зацікавив виріб: ${title}\nОбраний розмір: ${sizeText}\nТехніка: ${techText}\nМатеріал: ${matText}\nОрієнтовна вартість: ${price} грн.\n\nМої додаткові побажання: `;
      }
      openModal();
    });
  }

});
