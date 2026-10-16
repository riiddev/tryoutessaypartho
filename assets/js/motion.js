// GSAP polish; the app stays usable when animation is unavailable.
(function(){
 const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function animatePage(){
  if(!window.gsap||reduce)return;
  const gsap=window.gsap;
  const brand=document.querySelector('[data-component="header"] header .max-w-7xl');
  if(brand)gsap.fromTo(brand,{autoAlpha:0,y:-16},{autoAlpha:1,y:0,duration:.7,ease:'power3.out'});
  const home=document.querySelector('#section-package-selector:not(.hidden)');
  if(home)gsap.fromTo(home,{autoAlpha:0,y:16},{autoAlpha:1,y:0,duration:.65,delay:.08,ease:'power2.out'});
  const grid=document.getElementById('packages-landing-grid');
  if(grid){
   const observer=new MutationObserver(()=>{
    const cards=grid.querySelectorAll('.card-hover:not([data-motion-ready])');if(!cards.length)return;
    cards.forEach(card=>card.setAttribute('data-motion-ready','true'));
    gsap.fromTo(cards,{autoAlpha:0,y:12},{autoAlpha:1,y:0,duration:.42,stagger:.055,ease:'power2.out',clearProps:'transform'});
   });
   observer.observe(grid,{childList:true,subtree:true});
  }
  const panels=document.querySelectorAll('#section-admin > div,#section-evaluation > div');
  if(panels.length)gsap.fromTo(panels,{autoAlpha:0,y:10},{autoAlpha:1,y:0,duration:.45,stagger:.06,ease:'power2.out'});
 }
 if(window.__appComponentsReady)animatePage();else document.addEventListener('app:components-loaded',animatePage,{once:true});
})();
