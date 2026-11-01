(function(){
  // Top bar: hidden at the top, slides in once you scroll down
  var bar=document.getElementById('topbar');
  function onScroll(){ bar.classList.toggle('show', window.scrollY > 120); }
  window.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Hero video: skip for reduced motion (poster stays), otherwise fade in once playing
  var v=document.getElementById('heroVideo');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(v){
    if(reduce){ v.removeAttribute('autoplay'); v.pause(); }
    else{
      var on=function(){ v.classList.add('playing'); };
      v.addEventListener('playing', on); v.addEventListener('timeupdate', on, {once:true});
      if(!v.paused && v.readyState>2) on();
      var p=v.play(); if(p && p.catch){ p.catch(function(){}); }
    }
  }

  // Mobile menu
  var drawer=document.getElementById('drawer');
  var btns=document.querySelectorAll('.menu-btn');
  function setOpen(open){
    drawer.hidden=!open; document.body.style.overflow=open?'hidden':'';
    btns.forEach(function(b){ b.setAttribute('aria-expanded', open?'true':'false'); });
  }
  btns.forEach(function(b){ b.addEventListener('click', function(){ setOpen(drawer.hidden); }); });
  drawer.addEventListener('click', function(e){ if(e.target.tagName==='A' || e.target===drawer) setOpen(false); });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setOpen(false); });

  // Testimonials arrows
  var q=document.getElementById('quotes');
  document.querySelectorAll('.q-ctrl .round').forEach(function(b){
    b.addEventListener('click', function(){
      q.scrollBy({left: q.clientWidth * Number(b.dataset.dir), behavior: reduce?'auto':'smooth'});
    });
  });
})();
