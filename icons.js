const mixer = require('svg-mixer');

class MySprite extends mixer.Sprite {
    generate() {
        // Call parent `generate` method and then transform the tree
        return super.generate().then(svg => {
            svg.each('symbol', node => node.attrs.class = null);
            svg.each('symbol', node => node.attrs.fill = null);
            svg.each('symbol', node => node.attrs.stroke = null);
            svg.each('title', node => node = null);
            return svg;
        });
    }
}

mixer([
  // Directions
  'node_modules/heroicons/outline/chevron-left.svg',
  'node_modules/heroicons/outline/chevron-right.svg',
  'node_modules/heroicons/outline/arrow-down.svg',
  'node_modules/heroicons/outline/arrow-right.svg',
  // Brands
  'node_modules/simple-icons/icons/facebook.svg',
  'node_modules/simple-icons/icons/linkedin.svg',
  'node_modules/simple-icons/icons/twitter.svg',
  'node_modules/simple-icons/icons/xing.svg',
  // Misc
  'node_modules/heroicons/solid/calendar.svg',
  'node_modules/heroicons/solid/clock.svg',
  'node_modules/heroicons/outline/globe-alt.svg',
  'node_modules/heroicons/solid/location-marker.svg',
  'node_modules/heroicons/outline/ticket.svg',
  'node_modules/heroicons/solid/video-camera.svg',
], { spriteConfig: { usages: false }, spriteClass: MySprite } )
    .then(result => result.write('src/assets/img/icons.svg'));
