/* ============================
   GLOBAL VARIABLES
============================ */
let isModalOpen = false; // 🟢 Moved to the top so everything can use it
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeBtn');

/* ============================
   STARFIELD
============================ */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = [];

const DRIFT_SPEED = 0.4; 

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];
  const count = Math.floor((canvas.width * canvas.height) / 7000);
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.6 + 0.2,
      a: Math.random(),
      speed: Math.random() * 0.015 + 0.003,
      dx: -DRIFT_SPEED, 
      dy: DRIFT_SPEED 
    });
  }
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  stars.forEach(s => {
    s.a += s.speed;
    if (s.a > 1 || s.a < 0.1) s.speed *= -1;
    s.x += s.dx;
    s.y += s.dy;
    if (s.x < 0) s.x = canvas.width;
    if (s.x > canvas.width) s.x = 0;
    if (s.y < 0) s.y = canvas.height;
    if (s.y > canvas.height) s.y = 0;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.a})`;
    ctx.fill();
  });

  // Spawn MULTIPLE shooting stars
  if (Math.random() < 0.05) {
    shootingStars.push({
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height * 0.5, 
      len: 80 + Math.random() * 120,
      speed: 8 + Math.random() * 8,
      life: 1
    });
  }

  // Update and draw ALL shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let s = shootingStars[i];

    s.x += s.speed;
    s.y += s.speed * 0.5;

    const tailX = s.x - s.len;
    const tailY = s.y - (s.len * 0.5);

    const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    g.addColorStop(0, `rgba(255, 255, 255, ${s.life})`); 
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');          
    
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);         
    ctx.lineTo(tailX, tailY);     
    ctx.stroke();

    s.life -= 0.02;

    if (s.life <= 0) {
      shootingStars.splice(i, 1);
    }
  }

  requestAnimationFrame(drawStars);
}
drawStars();

/* ============================
   SOUND EFFECT GENERATOR
============================ */
function playLaserSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square'; 
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime); 
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch (e) {
    console.log("Audio not supported or blocked by browser");
  }
}

/* ============================
   ASTEROID BELT GENERATOR
============================ */
function generateAsteroids() {
  const belt = document.getElementById('asteroidBelt');
  if (!belt) return;

  const numAsteroids = 220;
  const radius = 225; 
  const beltWidth = 25; 

  for (let i = 0; i < numAsteroids; i++) {
    const angle = (i / numAsteroids) * Math.PI * 2 + Math.random() * 0.1;
    const r = radius + (Math.random() - 0.5) * beltWidth;
    const x = Math.cos(angle) * r + radius;
    const y = Math.sin(angle) * r + radius;

    const a = document.createElement('div');
    a.className = 'asteroid';
    a.style.left = x + 'px';
    a.style.top = y + 'px';

    const size = Math.random() * 1.8 + 0.8;
    a.style.width = size + 'px';
    a.style.height = size + 'px';

    const shades = ['#a8a29e', '#78716c', '#d6d3d1', '#57534e'];
    a.style.background = shades[Math.floor(Math.random() * shades.length)];

    belt.appendChild(a);
  }
}
generateAsteroids();

/* ============================
   ALIEN DEFENSE MINI-GAME
============================ */
let kills = 0;
let invaded = 0;
let aliens = [];
const alienEmoji = ['👾', '👽', '🛸'];

const killScoreEl = document.getElementById('killScore');
const invadedScoreEl = document.getElementById('invadedScore');

function getEarthPosition() {
  const earth = document.querySelector('.earth');
  if (!earth) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  const rect = earth.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}

function spawnAlien() {
  const alienEl = document.createElement('div');
  alienEl.className = 'alien';
  alienEl.textContent = alienEmoji[Math.floor(Math.random() * alienEmoji.length)];

  const w = window.innerWidth;
  const h = window.innerHeight;
  let startX, startY;
  const edge = Math.floor(Math.random() * 4);
  
  if (edge === 0) { startX = Math.random() * w; startY = -50; }
  else if (edge === 1) { startX = w + 50; startY = Math.random() * h; }
  else if (edge === 2) { startX = Math.random() * w; startY = h + 50; }
  else { startX = -50; startY = Math.random() * h; }

  alienEl.style.left = startX + 'px';
  alienEl.style.top = startY + 'px';
  document.body.appendChild(alienEl);

  const speed = 3 + Math.random() * 4; 
  
  const alienData = {
    el: alienEl,
    x: startX,
    y: startY,
    speed: speed,
    isDead: false
  };
  aliens.push(alienData);

  alienEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (alienData.isDead) return;
    alienData.isDead = true;
    
    kills++;
    killScoreEl.textContent = kills;
    playLaserSound(); 
    
    alienEl.classList.add('alien-explode');
    setTimeout(() => {
      if (alienEl.parentNode) alienEl.remove();
    }, 300);
  });
}

function updateAliens() {
  const earthPos = getEarthPosition();

  aliens.forEach(alien => {
    if (alien.isDead || isModalOpen) return; 

    const angle = Math.atan2(earthPos.y - alien.y, earthPos.x - alien.x);
    
    alien.x += Math.cos(angle) * alien.speed;
    alien.y += Math.sin(angle) * alien.speed;

    alien.el.style.left = alien.x + 'px';
    alien.el.style.top = alien.y + 'px';

    const dist = Math.hypot(alien.x - earthPos.x, alien.y - earthPos.y);
    const hitRadius = 25; 
    
    if (dist < hitRadius) {
      alien.isDead = true;
      invaded++;
      invadedScoreEl.textContent = invaded;
      alien.el.classList.add('alien-explode');

      setTimeout(() => {
        if (alien.el.parentNode) alien.el.remove();
      }, 300);
    }
  });

  aliens = aliens.filter(a => !a.isDead);
  requestAnimationFrame(updateAliens);
}
updateAliens();

setInterval(() => {
  if (aliens.length < 5) spawnAlien();
}, 2500);

/* ============================
   MODAL LOGIC
============================ */
document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => {
    const key = el.dataset.target;
    modalContent.innerHTML = content[key] || '<h2>Coming soon…</h2>';
    
    modal.classList.remove('active');
    void modal.offsetWidth; 
    modal.classList.add('active');
    
    isModalOpen = true; 
    document.body.classList.add('modal-open'); // Hide HUD when modal opens
  });
});

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modal.classList.remove('active');
  isModalOpen = false; 
  document.body.classList.remove('modal-open'); // Show HUD when modal closes
}

/* ============================
   CONSTELLATION CURSOR TRAIL
============================ */
let lastStarTime = 0;
document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  if (now - lastStarTime > 30) {
    createCursorStar(e.clientX, e.clientY); // 🟢 Fixed to clientX and clientY
    lastStarTime = now;
  }
});

function createCursorStar(x, y) {
  const star = document.createElement('div');
  star.className = 'cursor-star';
  star.style.left = x + 'px';
  star.style.top = y + 'px';
  document.body.appendChild(star);
  
  setTimeout(() => {
    if (star.parentNode) star.remove();
  }, 800);
}

/* ============================
   PARALLAX MOUSE EFFECT
============================ */
const solarSystem = document.querySelector('.solar-system');

document.addEventListener('mousemove', (e) => {
  const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 50;

  solarSystem.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

document.addEventListener('mouseleave', () => {
  solarSystem.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
});