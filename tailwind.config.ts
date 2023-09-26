import type { Config } from 'tailwindcss'

const {nextui} = require("@nextui-org/react");

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    colors: {
      'ribbon': {
        50: '#FEF0F1',
        100: '#FFE2E3',
        200: '#FFCACE',
        300: '#FE9EA8',
        400: '#FF687B',
        500: '#FF3352',
        600: '#F01944',
        700: '#A90832',
        800: '#900B31',
        900: '#510015',
        950: '#510015',
      },
      'buddha': {
          50: '#FCFBEA',
          100: '#FAF7C7',
          200: '#F6EC92',
          400: '#EAC725',
          500: '#E6B919',
          600: '#BC8912',
          700: '#966312',
          800: '#7D4F16',
          900: '#6A4119',
          950: '#3E220A',
        },
    }
  },
  
  darkMode: "class",

  plugins: [nextui()],
}
export default config
