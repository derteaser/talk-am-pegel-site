import{A as a,B as n}from"./vendor.fc7b360b.js";a.init({delay:200,duration:1e3,once:!0,mirror:!1});(function(){const t=document.querySelectorAll(".image-gallery a");for(let r=0;r<t.length;r++)t[r].addEventListener("click",function(e){e.preventDefault(),console.log(e.currentTarget.parentNode),n({el:e.target,imgSrc:e.currentTarget.getAttribute("href"),gallery:".image-gallery"})})})();
