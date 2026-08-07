/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // --- 🔄 Your Existing Variables ---
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        dark: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        background: 'rgb(var(--color-background) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',

        // --- 🌌 New Premium Eye-Calming Dark Theme System ---
        darkbg: '#0A110E',        // Deep matte canvas background
        darksurface: '#121E1A',   // Rich forest-charcoal surface for cards, panels & sidebars
        darkinput: '#1A2A24',     // Smooth, deep background for fields & selectors
        darkborder: '#233931',    // Ultra-low contrast clean line dividers
        darktext: '#E2EAE6',      // Soft luminous text (prevents eye strain)
        darksage: '#8AA399',      // Soothing matte gray-green for secondary subtitles
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(98, 129, 65, 0.35)',
        card: '0 8px 30px rgba(10, 17, 14, 0.4)', // Darker soft shadow profile
      },
      keyframes: {
        'truck-drive': {
          '0%': { transform: 'translateX(-25%)' },
          '100%': { transform: 'translateX(125%)' },
        },
        'truck-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        'wheel-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'road-scroll': {
          '0%': { backgroundPositionX: '0px' },
          '100%': { backgroundPositionX: '-48px' },
        },
        'exhaust-puff': {
          '0%': { transform: 'scale(0.4) translateX(0)', opacity: '0.5' },
          '100%': { transform: 'scale(1.4) translateX(-14px)', opacity: '0' },
        },
        'crt-flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
        'crt-turn-on': {
          '0%': {
            transform: 'scaleY(0.02) scaleX(1.2)',
            opacity: '0',
            filter: 'brightness(3)',
          },
          '30%': {
            transform: 'scaleY(1.05) scaleX(1)',
            opacity: '1',
            filter: 'brightness(2)',
          },
          '60%': {
            transform: 'scaleY(0.9)',
            filter: 'brightness(1.2)',
          },
          '100%': {
            transform: 'scaleY(1) scaleX(1)',
            opacity: '1',
            filter: 'brightness(1)',
          },
        },
      },
      animation: {
        'truck-drive': 'truck-drive 2.8s linear infinite',
        'truck-bounce': 'truck-bounce 0.5s ease-in-out infinite',
        'wheel-spin': 'wheel-spin 0.55s linear infinite',
        'road-scroll': 'road-scroll 0.6s linear infinite',
        'exhaust-puff': 'exhaust-puff 1s ease-out infinite',
        'crt-flicker': 'crt-flicker 4s infinite',
        'crt-turn-on': 'crt-turn-on 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
      },
    },
  },
  plugins: [],
};