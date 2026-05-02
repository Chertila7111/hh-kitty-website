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
  const duration = 1800, start = performance.now();
  const update = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const v = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    el.textContent = v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + 'K+' : v + (target === 94 ? '%' : '');
    if (p < 1) requestAnimationFrame(update);
    else el.textContent = target >= 1000 ? (target/1000).toFixed(target>=10000?0:1)+'K+' : target+(target===94?'%':'');
  };
  requestAnimationFrame(update);
}
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num[data-target]').forEach(el => animateCounter(el, parseInt(el.dataset.target)));
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.5 });
const statsEl = document.querySelector('.hero-stats');
if (statsEl) statsObserver.observe(statsEl);

// Nav highlight
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  const y = window.scrollY + 80;
  sections.forEach(sec => {
    if (y >= sec.offsetTop && y < sec.offsetTop + sec.offsetHeight)
      navLinks.forEach(a => { a.style.color = a.getAttribute('href') === '#' + sec.id ? 'var(--orange)' : ''; });
  });
}, { passive: true });

// Анимация вакансий в hero-mock
const VACANCIES = [
  { title: 'Python-разработчик',   company: 'Яндекс',     salary: 'от 200 000 ₽' },
  { title: 'Frontend Developer',    company: 'VK',         salary: 'от 180 000 ₽' },
  { title: 'Product Manager',       company: 'Ozon',       salary: 'от 220 000 ₽' },
  { title: 'Data Analyst',          company: 'Сбер',       salary: 'от 150 000 ₽' },
  { title: 'Backend Engineer',      company: 'Авито',      salary: 'от 240 000 ₽' },
  { title: 'UX/UI Designer',        company: 'Тинькофф',  salary: 'от 160 000 ₽' },
  { title: 'DevOps Engineer',       company: 'МТС',        salary: 'от 230 000 ₽' },
  { title: 'iOS Developer',         company: '2ГИС',       salary: 'от 210 000 ₽' },
  { title: 'Маркетолог',           company: 'Wildberries', salary: 'от 120 000 ₽' },
  { title: 'React Developer',       company: 'СберМаркет', salary: 'от 195 000 ₽' },
  { title: 'Аналитик данных',      company: 'Lamoda',      salary: 'от 140 000 ₽' },
  { title: 'Project Manager',       company: 'Ростелеком', salary: 'от 130 000 ₽' },
];

let vacIdx = 4; // следующая в очереди (первые 4 уже в HTML)
let sentCount = 13;
const countEl = document.getElementById('mockCount');
const timeEl  = document.getElementById('mockTime');
const mockList = document.getElementById('mockVacancyList');

// Статистика
const statNumInvite    = document.getElementById('statNumInvite');
const statNumReject    = document.getElementById('statNumReject');
const statNumInterview = document.getElementById('statNumInterview');
const statFillInvite   = document.getElementById('statFillInvite');
const statFillReject   = document.getElementById('statFillReject');
const statFillInterview = document.getElementById('statFillInterview');
let statsDisplayed = 0;
let inviteCount = 0, rejectCount = 0, interviewCount = 0;
let invitePending = 0, rejectPending = 0, interviewPending = 0;

function assignStats() {
  const target = Math.max(0, sentCount - 4);
  while (statsDisplayed < target) {
    const r = Math.random();
    if (r < 0.50) invitePending++;
    else if (r < 0.80) rejectPending++;
    else interviewPending++;
    statsDisplayed++;
  }
}

// Обновляет ширину баров пропорционально реальному распределению
function updateBars() {
  const total = Math.max(inviteCount + rejectCount + interviewCount, 1);
  statFillInvite.style.width    = (inviteCount    / total * 100) + '%';
  statFillReject.style.width    = (rejectCount    / total * 100) + '%';
  statFillInterview.style.width = (interviewCount / total * 100) + '%';
}

function showPlusOne(el) {
  const plus = document.createElement('span');
  plus.className = 'stat-plus';
  plus.textContent = '+1';
  el.appendChild(plus);
  setTimeout(() => plus.remove(), 900);
}

if (mockList && countEl && timeEl) {
  // Таймер
  let secs = 0;
  setInterval(() => {
    secs++;
    timeEl.textContent = Math.floor(secs/60) + ':' + String(secs%60).padStart(2,'0');
  }, 1000);

  // Назначаем категории часто, показываем каждую в своём ритме со всплывающим +1
  setInterval(assignStats, 1500);
  setInterval(() => { if (invitePending   > 0) { inviteCount++;    invitePending--;    statNumInvite.textContent    = inviteCount;    updateBars(); showPlusOne(statNumInvite);    } }, 3000);
  setInterval(() => { if (rejectPending   > 0) { rejectCount++;    rejectPending--;    statNumReject.textContent    = rejectCount;    updateBars(); showPlusOne(statNumReject);    } }, 4900);
  setInterval(() => { if (interviewPending > 0) { interviewCount++; interviewPending--; statNumInterview.textContent = interviewCount; updateBars(); showPlusOne(statNumInterview); } }, 7300);

  function nextVacancy() {
    const active = mockList.querySelector('.mock-vacancy.active');
    if (!active) return;

    // 1. Активная → отправлена
    active.classList.remove('active');
    const btn = active.querySelector('.mock-vbtn');
    btn.className = 'mock-vbtn sent';
    btn.innerHTML = '✓ Отклик';
    sentCount++;
    countEl.textContent = sentCount;

    // 2. Через 400мс добавляем новую карточку снизу
    setTimeout(() => {
      // Сначала удаляем лишние карточки (синхронно, до добавления новой)
      const existing = Array.from(mockList.querySelectorAll('.mock-vacancy'));
      for (let i = 0; i <= existing.length - 4; i++) existing[i].remove();

      const vac = VACANCIES[vacIdx % VACANCIES.length];
      vacIdx++;

      const card = document.createElement('div');
      card.className = 'mock-vacancy active';
      card.style.cssText = 'opacity:0;transform:translateY(8px);transition:opacity 0.3s,transform 0.3s';
      card.innerHTML =
        '<div class="mock-vline"></div>' +
        '<div class="mock-vtext">' +
          '<div class="mock-vtitle">' + vac.title + '</div>' +
          '<div class="mock-vsub">' + vac.company + ' · ' + vac.salary + '</div>' +
        '</div>' +
        '<div class="mock-vbtn loading"><span class="spinner"></span></div>';
      mockList.appendChild(card);

      // Плавное появление
      requestAnimationFrame(() => requestAnimationFrame(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }));
    }, 400);
  }

  // Запуск цикла
  setInterval(nextVacancy, 2200);
}

// Выравниваем высоту карточек тарифов
function equalPricingHeight() {
  const cards = document.querySelectorAll('.pricing-card');
  cards.forEach(c => c.style.height = '');
  if (window.innerWidth < 600) return;
  let max = 0;
  cards.forEach(c => { if (c.offsetHeight > max) max = c.offsetHeight; });
  cards.forEach(c => c.style.height = max + 'px');
}
window.addEventListener('load', equalPricingHeight);
window.addEventListener('resize', equalPricingHeight);
