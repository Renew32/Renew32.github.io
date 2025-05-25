AOS.init({ once: false }); // Active les animations multiples

// Scroll progress bar (déjà présent)
const progressBar = document.getElementById('progress-bar');
window.onscroll = function () {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let scrolled = (winScroll / height) * 100;
};

// Ajout des animations de sortie
const fadeOutElements = document.querySelectorAll('[data-aos]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) {
      entry.target.classList.add('fade-out');
    } else {
      entry.target.classList.remove('fade-out');
    }
  });
}, { threshold: 0.1 });

fadeOutElements.forEach(el => observer.observe(el));