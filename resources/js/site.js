import '../css/site.css';

import BigPicture from 'bigpicture/src/BigPicture';

import 'flyonui/flyonui';

import Alpine from 'alpinejs';
import intersect from '@alpinejs/intersect';

Alpine.plugin(intersect);

window.Alpine = Alpine;
Alpine.start();

(function () {
  // image gallery
  const imageLinks = document.querySelectorAll('.image-gallery a');
  for (let i = 0; i < imageLinks.length; i++) {
    imageLinks[i].addEventListener('click', function (e) {
      e.preventDefault();
      console.log(e.currentTarget.parentNode);
      BigPicture({
        el: e.target,
        imgSrc: e.currentTarget.getAttribute('href'),
        gallery: '.image-gallery',
        //galleryAttribute: 'href'
      });
    });
  }
})();
