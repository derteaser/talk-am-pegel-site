module.exports = {
  purge: {
    //enabled: true,
    content: [
      '../../site/snippets/*.php',
      '../../site/templates/*.php',
    ]
  },
  theme: {
    fontFamily: {
      'sans': [
        'Roboto',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        '"Helvetica Neue"',
        'Arial',
        '"Noto Sans"',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
        '"Noto Color Emoji"',
      ]
    },
    extend: {
      'colors': {
        'tap-red': {
          '200': '#FDAAAA',
          '500': '#FA5555',
          '800': '#F93C3C',
        },
        'tap-blue': {
          '200': '#A7B4C7',
          '500': '#4F6990',
          '800': '#3B5883',
        },
      }
    },
  },
  variants: {},
  plugins: [],
}
