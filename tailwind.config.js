/** @type {import('tailwindcss').Config} */
export default {
	darkMode: ['class'],
	content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				sans: [
					'Satoshi Variable',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'sans-serif'
				],
				display: [
					'Satoshi Variable',
					'system-ui',
					'sans-serif'
				],
				mono: [
					'JetBrains Mono',
					'Fira Code',
					'Consolas',
					'monospace'
				]
			},
			fontSize: {
				'2xs': ['0.625rem', { lineHeight: '0.75rem' }],
				'3xl': ['1.875rem', { lineHeight: '2.25rem' }],
				'4xl': ['2.25rem', { lineHeight: '2.5rem' }],
				'5xl': ['3rem', { lineHeight: '1.1' }],
				'6xl': ['3.75rem', { lineHeight: '1.1' }],
				'7xl': ['4.5rem', { lineHeight: '1.1' }],
				'8xl': ['6rem', { lineHeight: '1' }],
				'9xl': ['8rem', { lineHeight: '1' }]
			},
			spacing: {
				'18': '4.5rem',
				'72': '18rem',
				'84': '21rem',
				'96': '24rem',
				'128': '32rem'
			},
			borderRadius: {
				'4xl': '2rem',
				'5xl': '2.5rem',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			colors: {
				// Brand Colors
				'electric-blue': '#2F80ED',
				'deep-violet': '#5B2EFF',

				// Premium Color Palette
				'brand': {
					50: '#eef2ff',
					100: '#e0e7ff',
					200: '#c7d2fe',
					300: '#a5b4fc',
					400: '#818cf8',
					500: '#6366f1',
					600: '#4f46e5',
					700: '#4338ca',
					800: '#3730a3',
					900: '#312e81',
					950: '#1e1b4b',
				},

				// Semantic HSL Colors
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				border: 'hsl(var(--border))',
				ring: 'hsl(var(--ring))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				input: 'hsl(var(--input))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			boxShadow: {
				// Soft Shadows
				'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
				'soft-md': '0 4px 20px -4px rgba(0, 0, 0, 0.08), 0 8px 16px -4px rgba(0, 0, 0, 0.03)',
				'soft-lg': '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
				'soft-xl': '0 20px 50px -12px rgba(0, 0, 0, 0.12), 0 8px 24px -8px rgba(0, 0, 0, 0.06)',
				'soft-2xl': '0 25px 60px -15px rgba(0, 0, 0, 0.15), 0 10px 30px -10px rgba(0, 0, 0, 0.08)',

				// Glow Shadows
				'glow': '0 0 20px -5px rgba(99, 102, 241, 0.4)',
				'glow-lg': '0 0 40px -10px rgba(99, 102, 241, 0.3)',
				'glow-xl': '0 0 60px -15px rgba(99, 102, 241, 0.4)',
				'glow-primary': '0 0 30px -5px rgba(99, 102, 241, 0.5)',
				'glow-purple': '0 0 30px -5px rgba(139, 92, 246, 0.5)',
				'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.5)',
				'glow-rose': '0 0 30px -5px rgba(244, 63, 94, 0.5)',

				// Glass Effect
				'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
				'glass-lg': '0 8px 32px 0 rgba(31, 38, 135, 0.25)',

				// Colored Card Shadows
				'card-hover': '0 20px 40px -12px rgba(0, 0, 0, 0.15)',
				'card-active': '0 0 0 2px rgba(99, 102, 241, 0.3)',

				// Inner Shadows
				'inner-soft': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
				'inner-glow': 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
			},
			keyframes: {
				// Existing animations
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in-down': {
					'0%': { opacity: '0', transform: 'translateY(-20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-up': {
					'0%': { transform: 'scale(0.9)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'zoom-in': {
					'0%': { transform: 'scale(0.5)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px -5px rgba(99, 102, 241, 0.4)' },
					'50%': { boxShadow: '0 0 40px -5px rgba(99, 102, 241, 0.6)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.6)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'float-subtle': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-4px)' }
				},
				'bounce-subtle': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-3px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(-1deg)' },
					'50%': { transform: 'rotate(1deg)' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'blob-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'text-gradient-anim': {
					'0%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
					'100%': { 'background-position': '0% 50%' }
				},
				'border-flow': {
					'0%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
					'100%': { 'background-position': '0% 50%' }
				},
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'enter-from-right': {
					'0%': { transform: 'translateX(200px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'enter-from-left': {
					'0%': { transform: 'translateX(-200px)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
			},
			animation: {
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'fade-in-down': 'fade-in-down 0.5s ease-out',
				'slide-up': 'slide-up 0.4s ease-out',
				'slide-down': 'slide-down 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'scale-up': 'scale-up 0.3s ease-out',
				'zoom-in': 'zoom-in 0.3s ease-out',
				'shimmer': 'shimmer 2s infinite',
				'glow': 'glow 2s ease-in-out infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'float-subtle': 'float-subtle 3s ease-in-out infinite',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'wiggle': 'wiggle 0.3s ease-in-out',
				'spin-slow': 'spin-slow 8s linear infinite',
				'blob-spin': 'blob-spin 15s linear infinite',
				'text-gradient-anim': 'text-gradient-anim 5s ease infinite',
				'border-flow': 'border-flow 3s ease infinite',
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'enter-from-right': 'enter-from-right 0.25s ease',
				'enter-from-left': 'enter-from-left 0.25s ease',
			},
			backgroundImage: {
				// Brand Gradients
				'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
				'gradient-brand-subtle': 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
				'gradient-brand-radial': 'radial-gradient(ellipse at center, #6366f1 0%, #8b5cf6 100%)',

				// UI Gradients
				'gradient-primary': 'linear-gradient(135deg, #6366f1, #8b5cf6)',
				'gradient-secondary': 'linear-gradient(135deg, #f43f5e, #fb7185)',
				'gradient-success': 'linear-gradient(135deg, #10b981, #34d399)',
				'gradient-warning': 'linear-gradient(135deg, #f59e0b, #fbbf24)',
				'gradient-info': 'linear-gradient(135deg, #06b6d4, #22d3ee)',

				// Premium Gradients
				'gradient-premium': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
				'gradient-rainbow': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
				'gradient-sunset': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
				'gradient-ocean': 'linear-gradient(135deg, #667eea 0%, #4facfe 100%)',
				'gradient-aurora': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #667eea 100%)',

				// Mesh Gradients
				'gradient-mesh': 'radial-gradient(at 40% 20%, hsla(28,100%,74%,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.2) 0px, transparent 50%)',
				'gradient-mesh-dark': 'radial-gradient(at 40% 20%, hsla(265,100%,50%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,40%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(340,100%,50%,0.1) 0px, transparent 50%)',

				// Soft Backgrounds
				'gradient-soft-light': 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
				'gradient-soft-dark': 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.15) 0%, transparent 50%)',

				// Glass Overlays
				'gradient-glass': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
				'gradient-glass-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.05) 100%)',

				// Grid Patterns
				'grid-pattern': 'linear-gradient(to right, rgba(99, 102, 241, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(99, 102, 241, 0.03) 1px, transparent 1px)',
				'dot-pattern': 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px)',
			},
			backdropBlur: {
				xs: '2px',
			},
			transitionTimingFunction: {
				'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")]
}