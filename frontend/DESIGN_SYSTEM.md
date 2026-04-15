# SENTRA TERMINAL - Advanced UI/UX Design System v2

## Overview

SENTRA TERMINAL is a premium trading analytics terminal featuring cutting-edge glassmorphism design, gamification elements, and professional-grade real-time market intelligence. Built with Next.js 14, React 18, TypeScript, Tailwind CSS, and Framer Motion for 60fps animations.

## Design Philosophy

- **Premium & Modern**: Glassmorphic effects with frosted glass panels
- **Gamified**: Achievement badges, leaderboards, streaks, and tier systems
- **Data-Dense**: Multiple metrics visible simultaneously with clear hierarchy
- **Professional**: Bloomberg Terminal / TradingView inspired for institutional traders
- **Interactive**: Smooth micro-interactions, glow effects, and real-time animations
- **Dark-First**: Optimized for 24/7 trading environments (eye strain reduction)
- **Accessible**: WCAG 2.1 AA compliance with keyboard navigation support

## Color Palette

### Background Colors
- **Primary**: `#0A0E27` - Main background (navy-black)
- **Secondary**: `#1A1F3A` - Card/panel backgrounds
- **Tertiary**: `#0F1319` - Subtle variations
- **Elevated**: `#232D47` - Elevated surfaces

### Brand Colors
- **Deep Cyber Blue**: `#0066FF` - Primary CTA, trust, data precision
- **Electric Purple**: `#7C3AED` - Secondary features, intelligence, power
- **Neon Green**: `#00FF88` - Positive metrics, gains, buy signals
- **Hot Orange**: `#FF6B35` - Warnings, moderate risk, liquidations approaching
- **Neon Red**: `#FF1744` - Losses, sell signals, critical liquidations

### Text Colors
- **Primary**: `#F5F7FA` - High contrast main text
- **Secondary**: `#A0AEC0` - Supporting text and labels
- **Tertiary**: `#6B7280` - Disabled/subtle text
- **Muted**: `#4B5563` - Very subtle text

### Glassmorphism
- **Blur**: 12px-16px backdrop blur
- **Opacity**: 0.7-0.85 transparency
- **Border**: 1px solid rgba(255,255,255, 0.1-0.2)
- **Shadow**: Elevated glass shadows with subtle glow

## Typography

### Font Stack
- **UI Text**: Inter (400, 500, 600, 700) - Clean and modern
- **Financial Data**: IBM Plex Mono (400, 500, 600, 700) - Tabular numerals

### Font Sizes
- `xs`: 0.75rem (12px)
- `sm`: 0.875rem (14px)
- `base`: 1rem (16px)
- `lg`: 1.125rem (18px)
- `xl`: 1.25rem (20px)
- `2xl`: 1.5rem (24px)
- `3xl`: 1.875rem (30px)
- `4xl`: 2.25rem (36px)

### Typography Rules
- All prices, percentages, and metrics use **IBM Plex Mono** with `font-variant-numeric: tabular-nums`
- Heading hierarchy: h1 (36px) → h2 (28px) → h3 (24px) → h4 (20px)
- Body text: 14-16px for readability
- Line height: 1.5 for optimal readability

## Spacing System

Uses 4px base grid system:
- `0.5rem`: 8px
- `0.75rem`: 12px
- `1rem`: 16px
- `1.5rem`: 24px
- `2rem`: 32px
- `3rem`: 48px

## Component Library

### UI Components
- **MetricCard** - Display key metrics with trends, glow effects, and gamification
- **GlassPanel** - Glassmorphic container with animated borders and glow
- **GaugeChart** - Circular sentiment/progress gauges with SVG animations
- **AnimatedNumber** - Smooth number counter animations using requestAnimationFrame
- **StatusBadge** - Status indicators with animated glow
- **Skeleton** - Loading skeleton placeholders with pulse animation

### Layout Components
- **Navigation** - Floating glassmorphic navbar with real-time status
- **Sidebar** - Collapsible navigation with smooth animations and glow on active
- **GlobalMarketBar** - Fixed market data ticker
- **DashboardGrid** - Responsive grid layout with staggered animations

### Feature Components
- **TraderLeaderboard** - Gamified rankings with badges and streak indicators
- **AIMarketInsightPanel** - AI analysis with glassmorphic styling
- **LiquidationRadar** - Heatmap visualization for liquidation levels
- **WhaleTracker** - Live transaction feed with glass cards
- **MarketSentiment** - Gauge charts and sentiment indicators
- **3D Visualizations** - Canvas-based interactive 3D charts

## Animation & Interactions

### Entrance Animations
- Staggered children: 100-150ms between cards
- Fade in + slide up: 0.3s ease-out
- Scale in: 0.3s with 0.95 initial scale

### Hover Effects
- Cards: Lift up 4-8px with enhanced glow
- Buttons: Scale 1.05 with shadow glow
- Metrics: Highlight with color-specific glow

### Attention Animations
- Pulse glow: 2s infinite on positive metrics
- Shake warning: On liquidations approaching (0.4s)
- Wobble: Subtle rotation on important updates
- Badge pulse: 1.5s scale animation for achievements

### Interactive Elements
- Glow borders on hover/focus states
- Smooth color transitions (250-300ms)
- GPU-accelerated transforms (transform, opacity only)
- Reduced motion support for accessibility

### Motion Config
```javascript
// Standard transitions
easeOut: cubic-bezier(0.4, 0, 0.2, 1)
spring: stiffness: 60, damping: 20
duration: 0.3-0.6s for most animations
```

## Glassmorphism Effects

### Implementation
```css
background: rgba(26, 31, 58, 0.7);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.15);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
```

### Variants
- **Default**: 12px blur, 0.7 opacity
- **Large**: 16px blur, 0.8 opacity, elevated shadow
- **Small**: 8px blur, 0.6 opacity
- **Metric**: Special styling for metric cards with colored borders

## Gamification Elements

### Badges & Ranks
- **Gold (🥇)**: Top 3, 1st place - Legendary status
- **Silver (🥈)**: Top 3, 2nd place - Master status
- **Bronze (🥉)**: Top 3, 3rd place - Expert status
- **Achievement**: Purple-tinted badges for special achievements

### Streak Indicators
- Fire emoji with animated pulse
- Shows consecutive successful predictions
- Color: Hot orange background, bright orange text

### Progress Bars
- **Success**: Neon green gradient with glow
- **Warning**: Hot orange gradient with glow
- **Danger**: Neon red gradient with glow
- Height: 6px with 3px radius
- Fill animation: 500ms cubic-bezier

### Tier System
- **Elite** (Purple): Top 1% traders
- **Master** (Blue): Top 10% traders
- **Expert** (Green): Top 25% traders

## Layout System

### Page Padding
- Desktop: Theme adjusts for sidebar (72px or 20px width)
- Top padding: 24px-32px for floating navigation
- Horizontal: 24px-48px padding

### Grid System
- Desktop: 3-4 columns (300px+ card width)
- Tablet: 2-3 columns with collapsing sidebar
- Mobile: 1 column full-width cards

### Responsive Behavior
- Cards stack responsively
- Charts scale with container
- Tables scroll horizontally on mobile
- Touch-friendly: Min 44px tap targets

## Color Usage Strategy

### For Metrics
- **Green (#00FF88)**: Gains, positive change, trending up, buy signals
- **Red (#FF1744)**: Losses, negative change, trending down, sell signals
- **Orange (#FF6B35)**: Warnings, approaching liquidations, moderate risk
- **Blue (#0066FF)**: Primary info, neutral, default metrics
- **Purple (#7C3AED)**: Secondary features, AI insights, power

### For UI Elements
- **Backgrounds**: Navy and variations (primary/secondary)
- **Borders**: White/rgba with 10-20% opacity
- **Text**: Primary/secondary based on hierarchy
- **Accents**: Brand blue for CTAs, green for success, red for danger

## Accessibility

### Standards
- WCAG 2.1 AA compliance
- Color contrast: 4.5:1 for text, 3:1 for graphics
- Focus visible: Blue outline with glow shadow
- Keyboard navigation: All interactive elements reachable
- Aria labels: All buttons and form inputs

### Motion & Animations
- `prefers-reduced-motion` support (skip animations)
- No animations on page load past 3 seconds
- Animations don't distract from content
- Can be disabled per user preference

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile: iOS 14+, Android 12+

## Development Workflow

### CSS Variables
All colors use CSS custom properties for easy theming:
```css
--color-brand-blue: #0066FF;
--color-brand-green: #00FF88;
/* etc */
```

### Tailwind Configuration
- Extended theme with custom colors
- Custom animations and keyframes
- Glass effect utilities
- Glow shadow utilities

### Component Pattern
1. Use Tailwind utility classes as base
2. Add Framer Motion for interactions
3. Compose with CSS variables for colors
4. Use `glass-effect` classes for consistency

## Performance Optimization

### 60fps Animations
- Use `transform` and `opacity` only
- GPU acceleration via `will-change`
- Debounce scroll events
- Lazy load 3D visualizations

### Loading States
- Skeleton cards match component dimensions
- Pulse animation instead of spinners
- Stagger skeleton loaders for visual interest

## Best Practices

✅ DO:
- Use glass-effect classes for consistency
- Combine Tailwind + Framer Motion
- Stagger animations for visual hierarchy
- Use color-specific glows for feedback
- Support dark mode only (no light mode)
- Test with reduced motion settings

❌ DON'T:
- Mix color schemes (stick to palette)
- Create manual glass effects
- Animate on every interaction
- Use hard-coded colors
- Forget accessibility focus states
- Add animations that distract

## Future Enhancements

- [ ] Custom theme switcher (multiple dark themes)
- [ ] Animation intensity preferences
- [ ] High contrast mode for accessibility
- [ ] Real-time color theme based on market sentiment
- [ ] Custom metric card layouts (drag-drop)
- **Height**: 64px (fixed at top)
- **Position**: Sticky header
- **Left Offset**: 280px (sidebar width)
- **Content**: Market symbol, price, 24h change, funding rate, open interest, volume

### Main Grid
- **Columns**: 1 (mobile), 2 (tablet), 3 (desktop)
- **Gap**: 16px (1rem)
- **Responsive**: Automatic grid reflow

## Animations

### Transitions
- **Fast**: 150ms
- **Base**: 250ms
- **Slow**: 350ms
- **Slower**: 500ms

### Easing Functions
- **In**: `cubic-bezier(0.4, 0, 1, 1)`
- **Out**: `cubic-bezier(0, 0, 0.2, 1)`
- **InOut**: `cubic-bezier(0.4, 0, 0.2, 1)`
- **Sharp**: `cubic-bezier(0.4, 0, 0.6, 1)`

### Built-in Animations
- `pulse-glow` - Subtle opacity pulse
- `count-up` - Number animation
- `slide-in` - Slide from left
- `fade-in` - Fade entrance
- `bounce-subtle` - Subtle vertical bounce

## Shadows & Elevation

### Elevation Shadows
```
elevation-1: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
elevation-2: 0 4px 6px -1px rgba(0, 0, 0, 0.1)
elevation-3: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
elevation-4: 0 20px 25px -5px rgba(0, 0, 0, 0.1)
```

### Glow Effects
```
glow-blue: 0 0 20px rgba(59, 130, 246, 0.4)
glow-green: 0 0 20px rgba(34, 197, 94, 0.4)
glow-red: 0 0 20px rgba(239, 68, 68, 0.4)
```

## Glassmorphism

Used throughout for modern, premium aesthetic:
```css
background: rgba(17, 24, 39, 0.4);
backdrop-filter: blur(8px);
border: 1px solid rgba(45, 55, 72, 0.5);
```

## Interactive Elements

### Hover States
- Cards: -4px vertical lift with enhanced border
- Buttons: Scale and glow effects
- Text: Color transition

### Active States
- Navigation: Highlighted with blue accent
- Buttons: Scale down (0.95x)

### Focus States
- Ring: 2px ring with offset
- Color: Accent blue

## Responsiveness

### Breakpoints
- `xs`: 0px - Mobile
- `sm`: 640px - Small tablet
- `md`: 768px - Tablet
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop
- `2xl`: 1536px - Ultra-wide

### Mobile Optimizations
- Sidebar collapses to icons
- Grid reduces to single column
- Global bar content rearranges
- Touch-friendly tap targets (44px minimum)

## Performance Considerations

### Lazy Loading
- Charts render on demand
- 3D visualizations use Canvas
- Image optimization with Next.js Image

### Rendering Optimization
- Memoized components
- useCallback for event handlers
- Debounced updates
- Staggered animations

### CSS Optimization
- Tailwind CSS purging
- Critical CSS extraction
- Font subsetting (Inter and IBM Plex)

## Accessibility

### WCAG 2.1 AA Compliance
- Color contrast ratios: 4.5:1 minimum
- Keyboard navigation support
- Screen reader friendly
- Focus indicators visible
- Semantic HTML structure

### Keyboard Navigation
- Tab through interactive elements
- Arrow keys for navigation
- Enter/Space for activation
- Escape to close modals

## Best Practices

1. **Use Design System Variables** - Reference `src/lib/design-system.ts`
2. **Consistent Spacing** - Use 8px grid system
3. **Monospace for Finance** - Always use IBM Plex Mono for numbers
4. **Animations Subtle** - Keep animations under 500ms
5. **Glass Effects** - Use only on elevated surfaces
6. **Color Usage** - Consistent meaning across app
7. **Responsive First** - Mobile-first design approach
8. **Performance** - Lazy load heavy components

## File Structure

```
src/
├── lib/
│   ├── design-system.ts      # Design tokens and utilities
│   ├── api.ts                # API client
│   └── queryClient.ts        # React Query config
├── components/
│   ├── ui/                   # Base UI components
│   │   ├── MetricCard.tsx
│   │   ├── GlassPanel.tsx
│   │   ├── AnimatedNumber.tsx
│   │   ├── StatusBadge.tsx
│   │   └── Skeleton.tsx
│   ├── layout/               # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── GlobalMarketBar.tsx
│   │   └── DashboardGrid.tsx
│   ├── charts/               # Chart components
│   │   └── ProfessionalChart.tsx
│   ├── features/             # Feature components
│   │   ├── AIMarketInsightPanel.tsx
│   │   ├── MarketStoryTimeline.tsx
│   │   ├── LiquidationRadar.tsx
│   │   └── WhaleTracker.tsx
│   └── visualizations/       # 3D visualizations
│       ├── LiquidationMap3D.tsx
│       └── TradingGlobe3D.tsx
├── styles/
│   └── globals.css          # Global styles
└── app/
    ├── page.tsx             # Main page
    └── layout.tsx           # Root layout
```

## Future Enhancements

- [ ] TradingView Lightweight Charts integration
- [ ] Real-time WebSocket updates
- [ ] Customizable dashboard layouts
- [ ] Dark/Light theme toggle
- [ ] Export functionality
- [ ] Alerts and notifications
- [ ] Multi-symbol comparison
- [ ] Advanced charting tools
- [ ] Historical data analysis
- [ ] Mobile app responsive design
