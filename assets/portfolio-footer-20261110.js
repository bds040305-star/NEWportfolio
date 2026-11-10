/* Scoped footer controls — no changes to other portfolio interactions. */
(() => {
 const back = document.getElementById('ds-footer-back-to-top');
 if (!back) return;
 back.addEventListener('click', () => {
  window.dispatchEvent(new CustomEvent('portfolio:nav-target', {detail:{top:0}}));
  window.scrollTo({left:0,top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 });
})();