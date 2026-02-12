
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-red-glow': 'pulse-red-glow 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-red-line': 'pulse-red-line 6s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'pulse-red-glow': {
          '0%, 100%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(239, 68, 68, 0.05)' },
        },
        'pulse-red-line': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.2' },
        },
      },
    },
  },
  plugins: [],
}
