// Анимация появления элементов при скролле
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Анимация счётчиков в hero
function animateCounter(el, target) {
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.floor(eased * target);
    el.textContent = value >= 1000 ? (value / 1000).toFixed(value >= 10000 ? 0 : 1) + 'K+' : value + (target === 94 ? '%' : '');
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target >= 1000 ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'K+' : target + (target === 94 ? '%' : '');
  };
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num[data-target]').forEach(el => {
        animateCounter(el, parseInt(el.dataset.target));
      });
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// Плавная подсветка активного пункта nav
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 80;
  sections.forEach(sec => {
    if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + sec.id ? 'var(--orange)' : '';
      });
    }
  });
}, { passive: true });

// Анимация автооткликов в hero-mock
const VACANCIES = [
  { title: 'Python-разработчик',     company: 'Яндекс',    salary: 'от 200 000 ₽' },
  { title: 'Frontend Developer',      company: 'VK',        salary: 'от 180 000 ₽' },
  { title: 'Data Analyst',            company: 'Сбер',      salary: 'от 150 000 ₽' },
  { title: 'Product Manager',         company: 'Ozon',      salary: 'от 220 000 ₽' },
  { title: 'Backend Engineer',        company: 'Авито',     salary: 'от 240 000 ₽' },
  { title: 'UX/UI Designer',          company: 'Тинькофф', salary: 'от 160 000 ₽' },
  { title: 'DevOps Engineer',         company: 'МТС',       salary: 'от 230 000 ₽' },
  { title: 'iOS Developer',           company: '2ГИС',      salary: 'от 210 000 ₽' },
  { title: 'Маркетолог',             company: 'Wildberries',salary: 'от 120 000 ₽' },
  { title: 'React Developer',         company: 'СберМаркет',salary: 'от 195 000 ₽' },
  { title: 'Аналитик данных',        company: 'Lamoda',    salary: 'от 140 000 ₽' },
  { title: 'Project Manager',         company: 'Ростелеком',salary: 'от 130 000 ₽' },
];

const VISIBLE = 4; // видимых карточек одновременно
const list = document.getElementById('mockVacancyList');
const countEl = document.getElementById('mockCount');
const remainEl = document.getElementById('mockRemaining');
const timeEl = document.getElementById('mockTime');

if (list) {
  let queue = [...VACANCIES]; // очередь вакансий
  let sent = 0;
  let remaining = 100;
  let seconds = 0;
  let activeIdx = 0; // индекс активной карточки в DOM

  // Создаём начальный набор карточек
  function makeCard(vac, state) {
    const el = document.createElement('div');
    el.className = 'mock-vacancy' + (state === 'active' ? ' active' : '');
    el.innerHTML = `
      <div class="mock-vline"></div>
      <div class="mock-vtext">
        <div class="mock-vtitle">${vac.title}</div>
        <div class="mock-vsub">${vac.company} · ${vac.salary}</div>
      </div>
      <div class="mock-vbtn ${state === 'sent' ? 'sent' : state === 'active' ? 'loading' : ''}">
        ${state === 'sent' ? '✓ Отклик' : state === 'active' ? '<span class="spinner"></span>' : ''}
      </div>`;
    return el;
  }

  // Инициализация: показываем VISIBLE карточек
  // первые VISIBLE-1 уже "отправлены", последняя — активна
  const initial = queue.splice(0, VISIBLE);
  initial.forEach((vac, i) => {
    const state = i < VISIBLE - 1 ? 'sent' : 'active';
    list.appendChild(makeCard(vac, state));
  });
  sent = VISIBLE - 1;
  remaining = 100 - sent;
  countEl.textContent = sent;
  remainEl.textContent = remaining;

  // Таймер времени
  setInterval(() => {
    seconds++;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    timeEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
  }, 1000);

  // Цикл обработки вакансий
  function processNext() {
    const cards = list.querySelectorAll('.mock-vacancy');
    const activeCard = list.querySelector('.mock-vacancy.active');
    if (!activeCard) return;

    // Через 1.2с — помечаем активную как sent
    setTimeout(() => {
      activeCard.classList.remove('active');
      const btn = activeCard.querySelector('.mock-vbtn');
      btn.className = 'mock-vbtn sent';
      btn.innerHTML = '✓ Отклик';

      sent++;
      remaining = Math.max(0, 100 - sent);
      countEl.textContent = sent;
      remainEl.textContent = remaining;

      // Через 0.4с — добавляем новую карточку снизу и делаем её активной
      setTimeout(() => {
        // Берём следующую вакансию из очереди (циклично)
        if (queue.length === 0) queue = [...VACANCIES];
        const nextVac = queue.shift();
        const newCard = makeCard(nextVac, 'active');
        newCard.style.opacity = '0';
        newCard.style.transform = 'translateY(10px)';
        list.appendChild(newCard);

        // Плавное появление
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            newCard.style.transition = 'opacity 0.3s, transform 0.3s';
            newCard.style.opacity = '1';
            newCard.style.transform = 'translateY(0)';
          });
        });

        // Удаляем верхнюю карточку если их стало больше VISIBLE
        const allCards = list.querySelectorAll('.mock-vacancy');
        if (allCards.length > VISIBLE) {
          const toRemove = allCards[0];
          toRemove.style.transition = 'opacity 0.3s, transform 0.3s, max-height 0.3s';
          toRemove.style.opacity = '0';
          toRemove.style.transform = 'translateY(-10px)';
          toRemove.style.maxHeight = '0';
          toRemove.style.overflow = 'hidden';
          toRemove.style.marginBottom = '0';
          setTimeout(() => toRemove.remove(), 320);
        }

        // Следующий цикл
        setTimeout(processNext, 1800);
      }, 400);
    }, 1200);
  }

  // Запуск с задержкой
  setTimeout(processNext, 1400);
}
