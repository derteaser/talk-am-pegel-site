const mixer = require('svg-mixer');

class MySprite extends mixer.Sprite {
  generate() {
    // Call parent `generate` method and then transform the tree
    return super.generate().then((svg) => {
      svg.each('symbol', (node) => (node.attrs.class = null));
      svg.each('title', (node) => (node = null));
      return svg;
    });
  }
}

mixer(
  [
    // Directions
    'node_modules/heroicons/24/outline/chevron-left.svg',
    'node_modules/heroicons/24/outline/chevron-right.svg',
    'node_modules/heroicons/24/outline/arrow-down.svg',
    'node_modules/heroicons/24/outline/arrow-right.svg',
    // Brands
    'node_modules/simple-icons/icons/facebook.svg',
    'node_modules/simple-icons/icons/linkedin.svg',
    'node_modules/simple-icons/icons/x.svg',
    'node_modules/simple-icons/icons/xing.svg',
    // Misc
    'node_modules/heroicons/20/solid/calendar.svg',
    'node_modules/heroicons/20/solid/clock.svg',
    'node_modules/heroicons/24/outline/globe-alt.svg',
    'node_modules/heroicons/20/solid/map-pin.svg',
    'node_modules/heroicons/24/outline/ticket.svg',
    'node_modules/heroicons/20/solid/video-camera.svg',
  ],
  { spriteConfig: { usages: false }, spriteClass: MySprite },
).then((result) => result.write('public/img/icons.svg'));
