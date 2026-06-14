document.addEventListener('DOMContentLoaded', function(){
  // Ripple effect on buttons
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const d = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = d + 'px';
      circle.style.left = (e.clientX - rect.left - d/2) + 'px';
      circle.style.top = (e.clientY - rect.top - d/2) + 'px';
      circle.className = 'ripple';
      this.appendChild(circle);
      setTimeout(()=>{ if(circle && circle.parentNode) circle.parentNode.removeChild(circle); }, 650);
    });
  });

  // Improve keyboard accessibility for details/summary
  document.querySelectorAll('summary').forEach(s => {
    s.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        this.click();
      }
    });
  });
});

// Time-of-day: sun and moon positioning + theme
;(function(){
  const layer = document.querySelector('.time-layer');
  if(!layer) return;
  const sun = layer.querySelector('.sun');
  const moon = layer.querySelector('.moon');

  function setPositions(){
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    // normalize hour for continuous mapping (0-23 -> 0-24)
    let hAdj = h;
    if(h < 6) hAdj = h + 24; // treat early morning as extended day cycle

    if(hAdj >= 6 && hAdj < 18){
      // day
      layer.classList.remove('night');
      layer.classList.add('day');
      // progress 0..1 across 6..18
      const progress = ((hAdj + m/60) - 6) / 12;
      // left move from -10vw to 110vw
      const left = -10 + progress * 120; // vw
      // arc height using sine
      const top = 35 - Math.sin(progress * Math.PI) * 28; // vh
      sun.style.left = left + 'vw';
      sun.style.top = top + 'vh';
      // hide moon off-screen
      moon.style.left = '-20vw';
      moon.style.top = '10vh';
    } else {
      // night
      layer.classList.remove('day');
      layer.classList.add('night');
      // for night map, map 18..30 => progress 0..1 (hours >=18 mapped to 18..30)
      const hourForNight = (h < 6) ? h + 24 : h;
      const progress = ((hourForNight + m/60) - 18) / 12;
      const left = -10 + progress * 120; // vw
      const top = 30 - Math.sin(progress * Math.PI) * 18; // vh (lower arc)
      moon.style.left = left + 'vw';
      moon.style.top = top + 'vh';
      // hide sun off-screen
      sun.style.left = '-20vw';
      sun.style.top = '10vh';
    }
  }

  // initial set and update every 30s to keep in sync
  setPositions();
  setInterval(setPositions, 30000);
})();

// Falling leaves generator
;(function(){
  const field = document.querySelector('.leaf-field');
  if(!field) return;
  const emojis = ['🍃','🍂','🍁'];

  function spawnLeaf(){
    const leaf = document.createElement('span');
    leaf.className = 'leaf';
    leaf.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    const size = 14 + Math.random()*30; // px
    leaf.style.fontSize = size + 'px';
    const left = Math.random()*100; // vw percent
    leaf.style.left = left + 'vw';
    const duration = 6000 + Math.random()*9000; // ms
    leaf.style.animation = `leaf-fall ${duration}ms linear forwards`;
    // horizontal sway using transform translateX oscillation via CSS animation is complex; emulate with random translateX offset
    const initialOffset = (Math.random()-0.5)*40; // px
    leaf.style.transform = `translateX(${initialOffset}px)`;
    field.appendChild(leaf);
    setTimeout(()=>{ leaf.remove(); }, duration + 500);
  }

  // spawn leaves at interval, stop after a while to avoid overload
  let count = 0; const max = 45;
  const interval = setInterval(()=>{
    if(count++ > max){ clearInterval(interval); return; }
    spawnLeaf();
  }, 650);
})();

// Birds generator
;(function(){
  const field = document.querySelector('.bird-field');
  if(!field) return;
  // simple SVG bird (silhouette)
  const birdSVG = (size, color) => `
    <svg width="${size}" height="${Math.round(size*0.7)}" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 8c4-4 7-4 10-1 3-3 6-3 12 1" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`;

  function spawnBird(){
    const el = document.createElement('div');
    el.className = 'bird';
    const size = 24 + Math.random()*36; // px
    el.innerHTML = birdSVG(size, '#fff');
    // random vertical position (vh)
    const top = 6 + Math.random()*30; // 6-36vh
    el.style.top = top + 'vh';
    // direction
    const dir = Math.random() > 0.5 ? 'right' : 'left';
    el.classList.add(dir);
    // duration
    const duration = 7000 + Math.random()*8000; // ms
    el.style.animationDuration = duration + 'ms';
    // slight delay
    el.style.animationDelay = (Math.random()*1200) + 'ms';
    field.appendChild(el);
    setTimeout(()=>{ if(el && el.parentNode) el.parentNode.removeChild(el); }, duration + 2000);
  }

  // spawn a few birds randomly over time
  let spawned = 0;
  const birdInterval = setInterval(()=>{
    if(spawned++ > 8){ clearInterval(birdInterval); return; }
    // spawn 1-2 birds each tick
    spawnBird();
    if(Math.random() > 0.6) spawnBird();
  }, 2500 + Math.random()*2000);
})();
