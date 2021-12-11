const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    'site/snippets/**/*.php',
    'site/templates/**/*.php',
  ],
  darkMode: 'media',
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
      ],
    },
    extend: {
      'colors': {
        gray: colors.slate,
        'tap-red': {
          100: '#FFEEEE',
          200: '#FED5D5',
          300: '#FDBBBB',
          400: '#FC8888',
          500: '#FA5555',
          600: '#E14D4D',
          700: '#963333',
          800: '#712626',
          900: '#4B1A1A',
        },
        'tap-blue': {
          100: '#EDF0F4',
          200: '#D3DAE3',
          300: '#B9C3D3',
          400: '#8496B1',
          500: '#4F6990',
          600: '#475F82',
          700: '#2F3F56',
          800: '#242F41',
          900: '#18202B',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            a: {
              'font-weight': 600,
              textDecorationColor: theme('colors.tap-red.500'),
            },
            'a:hover': {
              color: theme('colors.tap-red.600'),
            },
            blockquote: {
              quotes: '"\\201E""\\201D""\\2018""\\2019"',
              fontStyle: 'normal',
              fontSize: theme('fontSize.xl'),
              paddingRight: theme('padding.6'),
              borderColor: theme('colors.tap-blue.600'),
              footer: {
                fontSize: theme('fontSize.sm')
              }
            }
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.200'),
            'blockquote, strong, h2, h3, h4, h5, thead': {
              color: theme('colors.gray.100'),
            },
            hr: {
              borderColor: theme('colors.gray.600'),
            }
          },
        }
      }),
    },
  },
  variants: {
    typography: ["dark"],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-debug-screens'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
