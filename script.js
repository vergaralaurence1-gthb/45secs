/* ============================
   STARFIELD
============================ */
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let stars = [];
let shootingStars = []; // 🟢 Changed to an array to hold multiple stars

/* ============================
   SOUND EFFECT GENERATOR
============================ */
function playLaserSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square'; // Gives it a retro, 8-bit laser feel
    
    // Start high and drop the pitch quickly to sound like a "pew"
    oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    // Volume control (fade out so it doesn't click)
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

  // Draw background drifting stars
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

 // 🟢 Spawn MULTIPLE shooting stars
  if (Math.random() < 0.05) {
    shootingStars.push({
      x: Math.random() * canvas.width, 
      y: Math.random() * canvas.height * 0.5, 
      len: 80 + Math.random() * 120,
      speed: 8 + Math.random() * 8,
      life: 1
    });
  }

  // 🟢 Update and draw ALL shooting stars
  for (let i = shootingStars.length - 1; i >= 0; i--) {
    let s = shootingStars[i];

    // Move the star FIRST, so we know where the new head is
    s.x += s.speed;
    s.y += s.speed * 0.5;

    // Calculate the tail position (behind the head)
    const tailX = s.x - s.len;
    const tailY = s.y - (s.len * 0.5);

    // Create gradient from HEAD (bold) to TAIL (fade)
    const g = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
    g.addColorStop(0, `rgba(255, 255, 255, ${s.life})`); // Bold at head
    g.addColorStop(1, 'rgba(255, 255, 255, 0)');          // Fade at tail
    
    ctx.strokeStyle = g;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);         // Start at head
    ctx.lineTo(tailX, tailY);     // Draw back to tail
    ctx.stroke();

    s.life -= 0.02;

    // Remove the star if it fades out
    if (s.life <= 0) {
      shootingStars.splice(i, 1);
    }
  }

  requestAnimationFrame(drawStars);
}
drawStars();

/* ============================
   ASTEROID BELT GENERATOR
   (Between Mars orbit-4 and Jupiter orbit-5)
============================ */
function generateAsteroids() {
  const belt = document.getElementById('asteroidBelt');
  if (!belt) return;

  const numAsteroids = 220;
  const radius = 225; // half of belt size (450/2)
  const beltWidth = 25; // thickness of belt

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
   MODAL CONTENT — FAKE INFO (edit later)
============================ */
const content = {
  sun: `
    <div class="modal-photo-wrapper">
        <img src="images/my-photo.jpg" alt="Laurence F. Vergara" class="modal-photo" />
    </div>
    <h2> Sun — About Me</h2>
    <h2> Laurence F. Vergara</h2>
    <p><strong>Course:</strong> BS Information Technology</p>
    <p><strong>Year:</strong> 3rd Year</p>
    <p><strong>Age:</strong> 21 Years Old</p>
    <p><strong>Birthdate:</strong> March 19, 2005</p>
    <p><strong>Address:</strong> 540 - D Tupas St. Cebu, City PH</p>
    <p><strong>Connect with me:</strong></p>
    <p style="font-size:0.85rem; color:#94a3b8; margin-top:-8px;">Click an icon to open in a new tab</p>
    <div class="social-logos">
      <a href="https://www.facebook.com/lauuuuuulau" target="_blank" rel="noopener" aria-label="Facebook" title="Facebook">
        <img src="images/facebook.png" alt="Facebook" />
      </a>
      <a href="https://www.instagram.com/lauuurence.vergara" target="_blank" rel="noopener" aria-label="Instagram" title="Instagram">
        <img src="images/instagram.png" alt="Instagram" />
      </a>
      <a href="https://github.com/vergaralaurence1-gthb" target="_blank" rel="noopener" aria-label="GitHub" title="GitHub">
        <img src="images/github.png" alt="GitHub" />
      </a>
      <a href="https://mail.google.com/mail/?view=cm&to=vergaralaurence1@gmail.com"
         target="_blank"
         rel="noopener"
         aria-label="Email"
         title="Email">
         <img src="images/email.png" alt="Email" />
      </a>
      <a href="tel:+639123456789" aria-label="Call" title="Call" class="phone-btn">
        <span>📞 +63 998 265 6081</span>
      </a>
    </div>
  `,
  family: `
    <div class="family-banner">
      <img src="images/family.jpg" alt="Vergara Family" class="family-photo" />
    </div>

    <h2> Mercury — Family</h2>
    <p>The closest planet to my sun. My family is my core, my first orbit, my constant gravity.</p>

    <div class="family-cards">

      <div class="family-card">
        <img src="images/father.jpg" alt="Father" class="card-photo" />
        <h3>Sherwin Vergara</h3>
        <p class="card-role">Father</p>
        <p class="card-note">Taught me patience and the value of hard work.</p>
      </div>

      <div class="family-card">
        <img src="images/mother.jpg" alt="Mother" class="card-photo" />
        <h3>Luvely Vergara</h3>
        <p class="card-role">Mother</p>
        <p class="card-note">Taught me kindness and how to stay resilient.</p>
      </div>

      <div class="family-card">
        <img src="images/sister.jpg" alt="Sister" class="card-photo" />
        <h3>Nicole Vergara</h3>
        <p class="card-role">Older Sister</p>
        <p class="card-note">My mentor and loudest cheerleader.</p>
      </div>

      <div class="family-card">
        <img src="images/brother.jpg" alt="Brother" class="card-photo" />
        <h3>Sean Paul Vergara</h3>
        <p class="card-role">Younger Brother</p>
        <p class="card-note">My gaming buddy and partner in mischief.</p>
      </div>

    </div>

    <p style="text-align:center; margin-top:20px;"><em>"We rise together."</em></p>
  `,
  about: `
    <h2> Venus — Personality</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "How I think, feel, and show up."
    </p>

    <p>
      Personality is the unique pattern of thinking, feeling, and behaving that stays consistent over time. 
      If my Sun is what I show the world and Mercury is where I come from, Venus is how I operate — my default settings.
    </p>

    <h3>My Big Five Profile</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:14px;">
      Based on the Five-Factor Model (OCEAN) — the most widely accepted framework for personality.
    </p>

    <div class="trait-container">
      <div class="trait-item">
        <div class="trait-header">
          <span><strong>Openness</strong> — Curiosity & Imagination</span>
          <span class="trait-level">High</span>
        </div>
        <div class="trait-bar"><div class="trait-fill" style="width: 85%;"></div></div>
        <p class="trait-note">I love exploring new ideas, abstract concepts, and unfamiliar ways of doing things. Routine bores me; novelty excites me.</p>
      </div>

      <div class="trait-item">
        <div class="trait-header">
          <span><strong>Conscientiousness</strong> — Organization & Goal-Directed</span>
          <span class="trait-level">Moderate</span>
        </div>
        <div class="trait-bar"><div class="trait-fill" style="width: 60%;"></div></div>
        <p class="trait-note">I can be highly organized when a task matters to me, but I also thrive in controlled chaos. I care more about getting it right than being perfectly rigid.</p>
      </div>

      <div class="trait-item">
        <div class="trait-header">
          <span><strong>Extraversion</strong> — Energy & Sociability</span>
          <span class="trait-level">Low / Ambivert</span>
        </div>
        <div class="trait-bar"><div class="trait-fill" style="width: 40%;"></div></div>
        <p class="trait-note">I recharge alone. I'm friendly and open, but I prefer deep one-on-one conversations over big crowds. I listen more than I speak.</p>
      </div>

      <div class="trait-item">
        <div class="trait-header">
          <span><strong>Agreeableness</strong> — Empathy & Cooperation</span>
          <span class="trait-level">High</span>
        </div>
        <div class="trait-bar"><div class="trait-fill" style="width: 80%;"></div></div>
        <p class="trait-note">I care deeply about how others feel. I try to be kind, cooperative, and avoid unnecessary conflict — but I still stand my ground when it matters.</p>
      </div>

      <div class="trait-item">
        <div class="trait-header">
          <span><strong>Neuroticism</strong> — Emotional Stability</span>
          <span class="trait-level">Low / Calm</span>
        </div>
        <div class="trait-bar"><div class="trait-fill" style="width: 35%;"></div></div>
        <p class="trait-note">I tend to stay calm under pressure. I overthink sometimes, but I rarely panic. I process emotions quietly rather than reacting quickly.</p>
      </div>
    </div>

    <h3>How This Shapes Me</h3>
    <p style="font-size:0.9rem;">
      Because I'm <strong>high in Openness</strong> and <strong>high in Agreeableness</strong>, I'm drawn to 
      problems that mix curiosity with empathy — design, technology, and anything that helps people. 
      My <strong>lower Extraversion</strong> and <strong>low Neuroticism</strong> mean I work best in calm, 
      focused environments where I can think things through before acting.
    </p>

    <h3>My Traits</h3>
    <div>
      <span class="chip">Curious</span>
      <span class="chip">Creative</span>
      <span class="chip">Calm</span>
      <span class="chip">Friendly</span>
      <span class="chip">Detail-oriented</span>
      <span class="chip">Reflective</span>
      <span class="chip">Open-minded</span>
      <span class="chip">Night Owl</span>
      <span class="chip">Organize</span>
      <span class="chip">Responsible</span>
    </div>

    <p style="text-align:center; margin-top:22px; font-style:italic; color:#94a3b8;">
      "I don't just want to build things — I want to understand why they work."
    </p>
  `,
  hobbies: `
    <h2> Earth — Hobbies & Interests</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "What I do for joy, and what I love to learn about."
    </p>

    <p>
      <strong>Hobbies</strong> are the active pursuits I do in my free time to relax. 
      <strong>Interests</strong> are the broader topics I enjoy reading, watching, and exploring.
    </p>

    <h3>Active Hobbies</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:14px;">Things I actually do to unwind and have fun.</p>
    
    <div class="hobby-grid">

      <!-- Gaming -->
      <div class="hobby-card">
        <div class="hobby-icon">🎮</div>
        <h4>Gaming</h4>
        <span class="hobby-cat">Digital & Tech</span>
        <p>Strategy and puzzle games that challenge my thinking — especially ones with high replay value.</p>
      </div>

      <!-- Basketball -->
      <div class="hobby-card">
        <div class="hobby-icon">🏀</div>
        <h4>Basketball</h4>
        <span class="hobby-cat">Active & Outdoor</span>
        <p>Playing pickup games with friends. It taught me teamwork, pressure, and how to lose gracefully.</p>
      </div>

      <!-- Sketching -->
      <div class="hobby-card">
        <div class="hobby-icon">🎨</div>
        <h4>Sketching</h4>
        <span class="hobby-cat">Creative Arts</span>
        <p>Mostly sketching user interfaces and wireframes. Occasionally I draw characters, but I'm better with UI.</p>
      </div>

      <!-- Listening -->
      <div class="hobby-card">
        <div class="hobby-icon">🎧</div>
        <h4>Music Listening</h4>
        <span class="hobby-cat">Relaxation</span>
        <p>Lo-fi and OPM are my focus tracks. I love discovering new artists and curating playlists for different moods.</p>
      </div>

    </div>

    <h3>Broader Interests</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:14px;">Topics I love learning about, reading, or watching.</p>
    
    <div class="hobby-grid">

      <!-- UI/UX -->
      <div class="hobby-card">
        <div class="hobby-icon">💻</div>
        <h4>UI/UX Design</h4>
        <span class="hobby-cat">Digital & Tech</span>
        <p>I follow design trends, read articles on usability, and study how great apps solve real problems.</p>
      </div>

      <!-- Astronomy -->
      <div class="hobby-card">
        <div class="hobby-icon">🔭</div>
        <h4>Space & Astronomy</h4>
        <span class="hobby-cat">Brainy & Intellectual</span>
        <p>I enjoy documentaries about space exploration, black holes, and the scale of the universe.</p>
      </div>

      <!-- Psychology -->
      <div class="hobby-card">
        <div class="hobby-icon">🧠</div>
        <h4>Psychology</h4>
        <span class="hobby-cat">Brainy & Intellectual</span>
        <p>Learning how people think, what motivates behavior, and why we make the decisions we do.</p>
      </div>

      <!-- Podcasts -->
      <div class="hobby-card">
        <div class="hobby-icon">🎙️</div>
        <h4>Tech Podcasts</h4>
        <span class="hobby-cat">Brainy & Intellectual</span>
        <p>Listening to developers and designers talk about their processes, failures, and tools.</p>
      </div>

    </div>

    <p style="text-align:center; margin-top:24px; font-style:italic; color:#94a3b8;">
      "Curiosity is my default state — I'm always looking for something new to understand."
    </p>
  `,
    favorites: `
    <h2> Mars — Favorites</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "The things I hold above all else."
    </p>

    <div class="podium-container">
      <!-- 2nd Place -->
      <div class="podium-item podium-silver">
        <div class="podium-rank">🥈</div>
        <div class="podium-content">
          <span class="podium-cat">Anime</span>
          <h4>Hunter x Hunter</h4>
        </div>
      </div>

      <!-- 1st Place -->
      <div class="podium-item podium-gold">
        <div class="podium-rank">🥇</div>
        <div class="podium-content">
          <span class="podium-cat">P-Pop Girl Group</span>
          <h4>BINI</h4>
        </div>
      </div>

      <!-- 3rd Place -->
      <div class="podium-item podium-bronze">
        <div class="podium-rank">🥉</div>
        <div class="podium-content">
          <span class="podium-cat">Video Game</span>
          <h4>CrossFire</h4>
        </div>
      </div>
    </div>

    <h3>Also on the list</h3>
    <ul class="favorites-list">
      <li>🖤 <strong>Color:</strong> Black</li>
      <li>🎨 <strong>Theme:</strong> Gothic</li>
      <li>🎵 <strong>Music:</strong> my angels only ones help me</li>
      <li>🍖 <strong>Food:</strong> Lechon</li>
      <li>💧 <strong>Drink:</strong> Water</li>
      <li>🎬 <strong>Movie:</strong> Twilight (All Seasons)</li>
      <li>🩸 <strong>TV Series:</strong> Dexter</li>
      <li>📚 <strong>Book:</strong> The 48 Laws of Power</li>
      <li>🏀 <strong>Sports:</strong> Basketball</li>
      <li>🦸 <strong>Hero:</strong> Blade</li>
      <li>🎭 <strong>Actor:</strong> Megan Fox</li>
      <li>🎞️ <strong>Director:</strong> Christopher Nolan</li>
      <li>🐦 <strong>Social Media:</strong> X (Twitter)</li>
      <li>🌧️ <strong>Weather:</strong> Rainy</li>
      <li>🐈 <strong>Animal:</strong> Cat</li>
      <li>📱 <strong>App:</strong> Phocid</li>
      <li>🏫 <strong>Subject:</strong> Recess</li>
      <li>🚗 <strong>Car:</strong> Honda Civic Type R</li>
      <li>📍 <strong>Place:</strong> Cebu</li>
    </ul>
  `,
  facts: `
    <h2> Jupiter — Fun Facts</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "Biggest planet, biggest surprises."
    </p>
    <p>A few random, slightly chaotic things about me for icebreakers and getting to know me.</p>

    <div class="facts-wall">
      
      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The Night Owl:</strong> I always sleep late. My brain literally wakes up at midnight and runs until dawn.</p>
      </div>

      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The Multitasker:</strong> I physically cannot eat a meal without watching videos on my phone.</p>
      </div>

      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The Early Bird:</strong> I finish my tasks as early as possible, so I can spend the rest of the day overthinking/free time.</p>
      </div>

      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The Goldfish Memory:</strong> I forgot where I put my things constantly. </p>
      </div>

      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The Appreciator:</strong> I have a pure, non-creepy obsession with beautiful girls. I just admire the aesthetic, It's an art form!</p>
      </div>

      <div class="fact-sticky">
        <span class="fact-pin">📌</span>
        <p><strong>The "Chronically Online":</strong> I can't fall asleep unless I've scrolled on my phone for at least an hour. My screen time report is terrifying.</p>
      </div>

    </div>
    
    <p style="text-align:center; margin-top:24px; font-style:italic; color:#94a3b8;">
      "Want more? Just ask me in person!"
    </p>
  `,
  skills: `
    <h2> Saturn — Skills</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "My rings — layers of ability I've built."
    </p>

    <h3>1. Technical / Hard Skills</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:12px;">Teachable, measurable, and task-specific abilities.</p>
    <div class="skill-tree">
      <div class="skill-item">
        <div class="skill-header">
          <span>🖥️ Frontend Development</span>
          <span class="skill-percent">40%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 40%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🗄️ Backend & Database</span>
          <span class="skill-percent">40%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 40%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🌐 Networking</span>
          <span class="skill-percent">50%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 50%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>📋 Project Management (PM)</span>
          <span class="skill-percent">50%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 50%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🤖 IoT & Electronics</span>
          <span class="skill-percent">50%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 50%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🛠️ IT Troubleshooting</span>
          <span class="skill-percent">50%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 50%;"></div></div>
      </div>

      <!-- Added extras to make it fuller -->
      <div class="skill-item">
        <div class="skill-header">
          <span>🔒 Cybersecurity Basics</span>
          <span class="skill-percent">35%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 35%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>☁️ Cloud Computing</span>
          <span class="skill-percent">30%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 30%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🐙 Version Control (Git/GitHub)</span>
          <span class="skill-percent">45%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 45%;"></div></div>
      </div>
    </div>

    <h3>2. 21st Century Skills (The 4 C's)</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:12px;">Core learning skills for modern work and life.</p>
    <div class="skill-tree">
      <div class="skill-item">
        <div class="skill-header">
          <span>🧠 Critical Thinking</span>
          <span class="skill-percent">85%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 85%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>💡 Creativity</span>
          <span class="skill-percent">80%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 80%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🤝 Collaboration</span>
          <span class="skill-percent">75%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 75%;"></div></div>
      </div>

      <div class="skill-item">
        <div class="skill-header">
          <span>🗣️ Communication</span>
          <span class="skill-percent">70%</span>
        </div>
        <div class="skill-bar"><div class="skill-fill" style="width: 70%;"></div></div>
      </div>
    </div>

    <h3>3. Core Workplace Skills</h3>
    <p style="font-size:0.85rem; color:#94a3b8; margin-bottom:12px;">Behavioral and interpersonal traits.</p>
    <div>
      <span class="chip">Time Management</span>
      <span class="chip">Adaptability</span>
      <span class="chip">Problem Solving</span>
      <span class="chip">Emotional Regulation</span>
      <span class="chip">Active Listening</span>
      <span class="chip">Productivity</span>
      <span class="chip">Detail-Oriented</span>
      <span class="chip">Initiative</span>
    </div>

    <p style="text-align:center; margin-top:24px; font-style:italic; color:#94a3b8;">
      "Always a student, always learning something new."
    </p>
  `,
  dreams: `
    <h2> Uranus — Dreams & Ambitions</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "A dream is the vision. An ambition is the drive to make it real."
    </p>

    <div class="timeline">

      <!-- Dream 1 -->
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="domain-tag">💼 Professional & Financial</span>
          <h4>The Dream: Financial Independence</h4>
          <p>To build a stable career in IT and reach a point where I have full control over my time and resources.</p>
          <div class="ambition-box">
            <strong>The Ambition:</strong> Master full-stack development, secure a high-paying tech role, and start investing early.
          </div>
        </div>
      </div>

      <!-- Dream 2 -->
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="domain-tag">🎨 Creative & Adventure</span>
          <h4>The Dream: Build and Explore</h4>
          <p>To create a product that people actually use, and to travel to new places without worrying about the cost.</p>
          <div class="ambition-box">
            <strong>The Ambition:</strong> Launch a personal app/portfolio, build a passive income stream, and travel to at least 3 new countries.
          </div>
        </div>
      </div>

      <!-- Dream 3 -->
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <span class="domain-tag">🤝 Legacy & Character</span>
          <h4>The Dream: Be the "Tech Guy" Who Helps</h4>
          <p>To be known not just as a skilled developer, but as someone who uses tech to make life easier for the people around them.</p>
          <div class="ambition-box">
            <strong>The Ambition:</strong> Mentor junior students, contribute to open-source projects, and build free tools for local communities.
          </div>
        </div>
      </div>

    </div>

    <p style="text-align:center; margin-top:24px; font-style:italic; color:#94a3b8;">
      "The vision is clear. The work starts now."
    </p>
  `,
  process: `
    <h2> Neptune — Design Process</h2>
    <p style="font-size:1.05rem; color:#e2e8f0; font-style:italic; margin-bottom:18px;">
      "Farthest planet — the deepest thinking."
    </p>
    <p>This website is not just a personal page; it is an interactive HCI case study. Here is how I used Module 7 (User Research) and Module 8 (User Modeling) to build it.</p>

    <div class="process-timeline">

      <!-- Step 1: Research -->
      <div class="process-step">
        <div class="step-badge">1</div>
        <div class="step-content">
          <span class="module-tag">Module 7 — User Research</span>
          <h4>Gathering the Data</h4>
          <p>I couldn't just guess what to put on the site. I used <strong>Qualitative Research</strong> (reflecting on my motivations and values) and <strong>Interviews</strong> (asking friends what they would want to know about me). I also used <strong>Quantitative Research</strong> to count my top favorites and skills to ensure the data was balanced.</p>
        </div>
      </div>

      <!-- Step 2: Modeling -->
      <div class="process-step">
        <div class="step-badge">2</div>
        <div class="step-content">
          <span class="module-tag">Module 8 — Understanding Users</span>
          <h4>Building the Persona</h4>
          <p>I couldn't design this for everyone, so I created a <strong>Proto-Persona</strong>: "Evaluating Teacher Theo." His goals were to assess my HCI skills in under 60 seconds without being bored. His pain points were generic, wall-of-text websites. I used an <strong>Empathy Map</strong> to ensure the design addressed his need for instant clarity and interactivity.</p>
        </div>
      </div>

      <!-- Step 3: Design Decisions -->
      <div class="process-step">
        <div class="step-badge">3</div>
        <div class="step-content">
          <span class="module-tag">HCI Principles Applied</span>
          <h4>The Solar System Metaphor</h4>
          <p>To solve the "boring" problem, I used the solar system as a <strong>Mental Model</strong>. The Sun represents my core identity, and the planets act as <strong>Recognition over Recall</strong> cues — each one holds a specific, chunked piece of information. The <strong>Asteroid Belt</strong> was added as a visual separator between my inner personal life (Mercury–Mars) and my outer aspirations (Jupiter–Neptune).</p>
        </div>
      </div>

      <!-- Step 4: Testing & Iteration -->
      <div class="process-step">
        <div class="step-badge">4</div>
        <div class="step-content">
          <span class="module-tag">Iterative Design</span>
          <h4>Refining the Experience</h4>
          <p>Through <strong>Iterative Design</strong>, I tested the prototype. I realized that a simple text list was too plain, so I iterated the designs: Mars became a Podium (for gamification), Jupiter became Sticky Notes (for a chaotic, fun vibe), and Saturn became a Dashboard (for clear data visualization). Every popup has <strong>Feedback</strong> (hover effects) and <strong>User Control</strong> (click outside or press ESC to close).</p>
        </div>
      </div>

    </div>

    <p style="text-align:center; margin-top:24px; font-style:italic; color:#94a3b8;">
      "Good design is invisible. Great design is a journey."
    </p>
  `,
};

/* ============================
   MODAL LOGIC
============================ */
const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeBtn = document.getElementById('closeBtn');

document.querySelectorAll('[data-target]').forEach(el => {
  el.addEventListener('click', () => {
    const key = el.dataset.target;
    modalContent.innerHTML = content[key] || '<h2>Coming soon…</h2>';
    
    // 🟢 Force the animation to restart if they click another planet
    modal.classList.remove('active');
    void modal.offsetWidth; // This trick forces the browser to re-render
    modal.classList.add('active');
    
    isModalOpen = true; 
  });
});

closeBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

function closeModal() {
  modal.classList.remove('active');
  isModalOpen = false; // 🟢 RESUME ALIENS
}

/* ============================
   ALIEN DEFENSE MINI-GAME
============================ */
let kills = 0;
let invaded = 0;
let aliens = [];
let isModalOpen = false; // 🟢 ADD THIS LINE
const alienEmoji = ['👾', '👽', '🛸'];

const killScoreEl = document.getElementById('killScore');
const invadedScoreEl = document.getElementById('invadedScore');

// Helper function to find the Earth's current position
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

  // Spawn from a random edge
  let startX, startY;
  const edge = Math.floor(Math.random() * 4);
  
  if (edge === 0) { startX = Math.random() * w; startY = -50; } // Top
  else if (edge === 1) { startX = w + 50; startY = Math.random() * h; } // Right
  else if (edge === 2) { startX = Math.random() * w; startY = h + 50; } // Bottom
  else { startX = -50; startY = Math.random() * h; } // Left

  alienEl.style.left = startX + 'px';
  alienEl.style.top = startY + 'px';
  document.body.appendChild(alienEl);

  // Store starting position and speed
  const speed = 3 + Math.random() * 4; 
  
  const alienData = {
    el: alienEl,
    x: startX,
    y: startY,
    speed: speed,
    isDead: false
  };
  aliens.push(alienData);

  // Click to kill
  alienEl.addEventListener('click', (e) => {
    e.stopPropagation();
    if (alienData.isDead) return;
    alienData.isDead = true;
    
    kills++;
    killScoreEl.textContent = kills;

    // 🟢 ADD THIS LINE TO PLAY THE SOUND
    playLaserSound(); 
    
    alienEl.classList.add('alien-explode');
    setTimeout(() => {
      if (alienEl.parentNode) alienEl.remove();
    }, 300);
  });
}

// Game Loop
function updateAliens() {
  // Get the CURRENT position of the spinning Earth
  const earthPos = getEarthPosition();

aliens.forEach(alien => {
    if (alien.isDead || isModalOpen) return; // 🟢 ADDED isModalOpen// Skip if already dead

    // 1. Calculate the angle to the Earth
    const angle = Math.atan2(earthPos.y - alien.y, earthPos.x - alien.x);
    
    // 2. Move alien towards the Earth
    alien.x += Math.cos(angle) * alien.speed;
    alien.y += Math.sin(angle) * alien.speed;

    // 3. Apply new position to screen
    alien.el.style.left = alien.x + 'px';
    alien.el.style.top = alien.y + 'px';

    // 4. Check collision
    const dist = Math.hypot(alien.x - earthPos.x, alien.y - earthPos.y);
    const hitRadius = 25; 
    
    if (dist < hitRadius) {
      // 🟢 THE FIX: Mark as dead IMMEDIATELY so the loop stops tracking it
      alien.isDead = true;
      
      // Update score
      invaded++;
      invadedScoreEl.textContent = invaded;

      // 🟢 Apply the explosion class FIRST
      alien.el.classList.add('alien-explode');

      // 🟢 Wait for the 0.3s CSS explosion to finish BEFORE removing the element
      setTimeout(() => {
        if (alien.el.parentNode) {
          alien.el.remove();
        }
      }, 300);
    }
  });

  // Clean up dead aliens from the array
  aliens = aliens.filter(a => !a.isDead);

  requestAnimationFrame(updateAliens);
}

// Start Game
updateAliens();

// Spawn aliens randomly
setInterval(() => {
  if (aliens.length < 5) {
    spawnAlien();
  }
}, 2500);

// Inside the click listener:
document.body.classList.add('modal-open');
isModalOpen = true; 

// Inside closeModal():
document.body.classList.remove('modal-open');
isModalOpen = false; 

/* ============================
   CONSTELLATION CURSOR TRAIL
============================ */
let lastStarTime = 0;
document.addEventListener('mousemove', (e) => {
  const now = Date.now();
  // Only spawn a star every 30 milliseconds so it doesn't lag
  if (now - lastStarTime > 30) {
    createCursorStar(e.pageX, e.pageY);
    lastStarTime = now;
  }
});

function createCursorStar(x, y) {
  const star = document.createElement('div');
  star.className = 'cursor-star';
  star.style.left = x + 'px';
  star.style.top = y + 'px';
  document.body.appendChild(star);
  
  // Remove the star after the animation finishes
  setTimeout(() => {
    if (star.parentNode) star.remove();
  }, 800);
}

/* ============================
   PARALLAX MOUSE EFFECT
============================ */
const solarSystem = document.querySelector('.solar-system');

document.addEventListener('mousemove', (e) => {
  // Calculate how far the mouse is from the center of the screen (-1 to 1)
  const xAxis = (window.innerWidth / 2 - e.pageX) / 50;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 50;

  // Apply the 3D rotation to the solar system
  solarSystem.style.transform = `perspective(1000px) rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
});

// Reset the tilt when the mouse leaves the window
document.addEventListener('mouseleave', () => {
  solarSystem.style.transform = `perspective(1000px) rotateY(0deg) rotateX(0deg)`;
});