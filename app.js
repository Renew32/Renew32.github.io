AOS.init({ once: true });

// Scroll progress bar
const progressBar = document.getElementById('progress-bar');
window.onscroll = function () {
  let winScroll = document.body.scrollTop || document.documentElement.scrollTop;
  let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  let scrolled = (winScroll / height) * 100;
};