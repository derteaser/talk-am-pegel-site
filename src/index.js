import './index.css'

import AOS from 'aos'
import 'aos/dist/aos.css'

import BigPicture from "bigpicture/src/BigPicture"

AOS.init({
  delay: 200, // values from 0 to 3000, with step 50ms
  duration: 1000, // values from 0 to 3000, with step 50ms
  once: true, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
});

(function() {
  // image gallery
  const imageLinks = document.querySelectorAll('.image-gallery a');
  for (let i = 0; i < imageLinks.length; i++) {
    imageLinks[i].addEventListener('click', function (e) {
      e.preventDefault()
      console.log(e.currentTarget.parentNode)
      BigPicture({
        el: e.target,
        imgSrc: e.currentTarget.getAttribute('href'),
        gallery: '.image-gallery',
        //galleryAttribute: 'href'
      })
    })
  }
})();
