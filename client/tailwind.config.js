/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        haze: '#DDE5E4',
        paper: '#EEF2F1',
        ink: '#12262B',
        slate: {
          DEFAULT: '#4B6168',
          50: '#F5F7F7',
          100: '#E9ECEC',
          200: '#CFD7D9',
          300: '#A4B4B8',
          400: '#758D93',
          500: '#4B6168',
          600: '#3D5056',
          700: '#303F44',
          800: '#232E32',
          900: '#172023',
        },
        signal: {
          DEFAULT: '#1B6B8A',
          hover: '#15566F',
          light: '#E6F0F4',
        },
        alert: {
          DEFAULT: '#B3321E',
          hover: '#942918',
          light: '#FCEBE8',
        },
        // AQI specific data colours (CPCB / Indian National AQI scale)
        aqi: {
          good: '#00B050',         // 0 - 50
          satisfactory: '#92D050', // 51 - 100
          moderate: '#D4A017',     // 101 - 200
          poor: '#FF9900',         // 201 - 300
          veryPoor: '#E63946',     // 301 - 400
          severe: '#7E0023',       // 401 - 500
          severePlus: '#4A0014',   // > 500
        }
      },
      fontFamily: {
        serif: ['"Newsreader"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderWidth: {
        'hairline': '0.5px',
      },
      borderRadius: {
        'card': '10px',
        'badge': '4px',
        'button': '6px',
        'pill': '9999px',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(18, 38, 43, 0.05)',
        'elevated': '0 4px 12px 0 rgba(18, 38, 43, 0.08)',
        'modal': '0 12px 32px 0 rgba(18, 38, 43, 0.16)',
      }
    },
  },
  plugins: [],
}
