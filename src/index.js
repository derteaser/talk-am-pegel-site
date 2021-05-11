import 'vite/dynamic-import-polyfill'
import './index.css'

import AOS from 'aos'
import 'aos/dist/aos.css'

AOS.init({
  delay: 200, // values from 0 to 3000, with step 50ms
  duration: 1000, // values from 0 to 3000, with step 50ms
  once: true, // whether animation should happen only once - while scrolling down
  mirror: false, // whether elements should animate out while scrolling past them
});