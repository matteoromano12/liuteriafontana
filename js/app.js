document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }});
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.querySelector('.dropdown');
  const dropdownToggle = document.querySelector('.dropdown-toggle');

  if (dropdownToggle) {
    dropdownToggle.addEventListener('click', (e) => {
      e.preventDefault();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }
});

const photos = [...document.querySelectorAll(".gallery .ph")];

const viewer = document.getElementById("galleryViewer");
const image = document.getElementById("gvImage");

const prev = viewer.querySelector(".gv-prev");
const next = viewer.querySelector(".gv-next");
const close = viewer.querySelector(".gv-close");
const overlay = viewer.querySelector(".gv-overlay");

let current = 0;

function getImage(div){
  const bg = getComputedStyle(div).backgroundImage;
  return bg.slice(5,-2);
}

function show(index){

  current = index;

  image.src = getImage(photos[index]);

  viewer.classList.add("open");

  document.body.style.overflow="hidden";

}

function hide(){

  viewer.classList.remove("open");

  document.body.style.overflow="";

}

function previous(){

  current--;

  if(current<0)
    current=photos.length-1;

  image.src=getImage(photos[current]);

}

function following(){

  current++;

  if(current>=photos.length)
    current=0;

  image.src=getImage(photos[current]);

}

photos.forEach((photo,index)=>{

  photo.style.cursor="pointer";

  photo.addEventListener("click",()=>show(index));

});

prev.onclick=previous;
next.onclick=following;

close.onclick=hide;
overlay.onclick=hide;

document.addEventListener("keydown",(e)=>{

  if(!viewer.classList.contains("open"))
    return;

  if(e.key==="Escape")
    hide();

  if(e.key==="ArrowLeft")
    previous();

  if(e.key==="ArrowRight")
    following();

});
