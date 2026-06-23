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

 // 5. Відправка форми у Telegram-бот
  const TELEGRAM_TOKEN = '8833646323:AAGfXYN1cyAiPyrNfjtu9b_MSlWJKFnO0C8';
  const CHAT_ID = '8522043344';

  // Функція для відправки даних
  const sendToTelegram = async (form, messageElement, isContactForm = false) => {
    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Відправка...';
    submitBtn.disabled = true;

    // Отримуємо дані з форми
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Формуємо гарне повідомлення для Telegram
    let text = `🌟 <b>Нова заявка з сайту!</b>\n\n`;
    text += `👤 <b>Ім'я:</b> ${data.name || 'Не вказано'}\n`;
    text += `📞 <b>Контакт:</b> ${data.contact || 'Не вказано'}\n`;
    
    // Перевіряємо, чи є ці поля у формі (бо на сторінці контактів їх немає)
    if (data.format) text += `🧵 <b>Матеріал:</b> ${data.format}\n`;
    if (data.size) text += `📏 <b>Розмір:</b> ${data.size}\n`;
    if (data.comment) text += `📝 <b>Повідомлення/Коментар:</b>\n${data.comment}\n`;

    try {
      const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: text,
          parse_mode: 'HTML' // Дозволяє використовувати жирний шрифт
        })
      });

      if (response.ok) {
        if (messageElement) {
          messageElement.textContent = 'Дякуємо! Ваша заявка успішно відправлена. Майстриня зв\'яжеться з вами найближчим часом.';
          messageElement.className = 'form-message success';
        }
        form.reset();
        
        // Закриваємо модальне вікно через 3 секунди після успішної відправки
        if (!isContactForm) {
          setTimeout(() => {
            const modal = document.getElementById('order-modal');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
            if (messageElement) messageElement.textContent = ''; // Очищаємо повідомлення для наступного разу
          }, 3000);
        }
      } else {
        throw new Error('Telegram API error');
      }
    } catch (err) {
      console.error(err);
      if (messageElement) {
        messageElement.textContent = 'Сталася помилка при відправці. Будь ласка, зв\'яжіться напряму через месенджери.';
        messageElement.className = 'form-message error';
      }
    } finally {
      // Повертаємо кнопці початковий вигляд
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  };

  // Підключаємо обробник для головної форми (у модальному вікні)
  const orderForm = document.getElementById('order-form');
  const formMessage = document.getElementById('form-message');
  if (orderForm) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendToTelegram(orderForm, formMessage, false);
    });
  }

  // Підключаємо обробник для форми на сторінці контактів / доставки
  const pageContactForm = document.getElementById('page-contact-form');
  const pageFormMessage = document.getElementById('page-form-message');
  if (pageContactForm) {
    pageContactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendToTelegram(pageContactForm, pageFormMessage, true);
    });
  }
    // ================= Галерея на сторінці товару =================
  window.changeImage = function(element) {
    const mainImg = document.getElementById('main-product-img');
    if(mainImg) {
      mainImg.src = element.src; // Змінюємо головне фото
      
      // Змінюємо активний клас на мініатюрах
      document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
      element.classList.add('active');
    }
  };
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
