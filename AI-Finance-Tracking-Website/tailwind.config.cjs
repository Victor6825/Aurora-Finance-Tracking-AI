module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'ai-bg': '#020617', // deep bluish slate
        'ai-panel': '#020617',
        'ai-blue': '#1d4ed8',
        'ai-neon': '#22c55e',
        'ai-silver': '#cbd5f5',
        'ai-purple': '#8b5cf6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 40px rgba(34,197,94,0.45)',
      },
      backgroundImage: {
        'ai-grid':
          'radial-gradient(circle at 1px 1px, rgba(148,163,184,0.18) 1px, transparent 0)',
      },
      backgroundSize: {
        'ai-grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
