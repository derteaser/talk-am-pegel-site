import{m as r,a as l,A as i,B as n}from"./vendor.a4dc6484.js";r.plugin(l);window.Alpine=r;r.start();i.init({delay:200,duration:1e3,once:!0,mirror:!1});(function(){const a=document.querySelectorAll(".image-gallery a");for(let t=0;t<a.length;t++)a[t].addEventListener("click",function(e){e.preventDefault(),console.log(e.currentTarget.parentNode),n({el:e.target,imgSrc:e.currentTarget.getAttribute("href"),gallery:".image-gallery"})})})();