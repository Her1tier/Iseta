# Iseta Design System & Style Guide

> **Living Document** - Last Updated: 2025-12-29

This is the single source of truth for Iseta's design system. All design decisions, components, and patterns should reference this guide.

---

## 🎨 Design Philosophy

**Minimalist & Professional**
- Pure black and white aesthetic
- Clean typography with generous whitespace
- Subtle animations and interactions
- Mobile-first responsive design

---

## 🎨 Color Palette

### Core Colors

```css
/* Primary */
--color-black: #0A0F11;           /* Primary backgrounds, buttons, text (dark blue-black) */
--color-white: #F1F1EF;           /* Primary backgrounds (off-white) */

/* Grayscale */
--color-gray-50: #f9fafb;         /* Light backgrounds */
--color-gray-100: #f3f4f6;        /* Card backgrounds */
--color-gray-200: #e5e7eb;        /* Borders, dividers */
--color-gray-400: #9ca3af;        /* Secondary text */
--color-gray-500: #6b7280;        /* Tertiary text */
--color-gray-600: #4b5563;        /* Body text on white */
--color-gray-700: #374151;        /* Emphasis text */
--color-gray-800: #1f2937;        /* Dark elements on black */
--color-gray-900: #111827;        /* Primary text */
```

### Usage Guidelines

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Page Background | `#F1F1EF` (off-white) | `black` |
| Section Background (Alternate) | `gray-50` | `black` |
| Primary Text | `gray-900` | `white` |
| Secondary Text | `gray-600` | `gray-400` |
| Borders | `gray-200` | `gray-800` |
| Cards | `white` or `gray-100` | `gray-900` |

### Deprecated Colors

❌ **DO NOT USE:**
- `--color-iseta-accent: #c4f45d` (Lime green - removed)
- `--color-iseta-purple: #8b5cf6` (Purple - removed)
- `--color-iseta-blue: #3b82f6` (Blue - removed)
- Any gradient backgrounds with colors

---

## ✍️ Typography

### Font Family

```css
font-family: 'Arial', sans-serif;
```

**Import:**
```css
/* No import needed - Arial is a system font */
font-family: 'Arial', sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Hero Headline | `5rem` (80px) | 800 | 1.1 | Main page headlines |
| Headline XL | `4.5rem` (72px) | 700 | 1.2 | Section titles |
| Headline L | `3rem` (48px) | 700 | 1.3 | Subsection titles |
| Headline M | `2rem` (32px) | 700 | 1.4 | Card titles |
| Headline S | `1.5rem` (24px) | 600 | 1.4 | Component headers |
| Body L | `1.25rem` (20px) | 400 | 1.6 | Lead paragraphs |
| Body | `1rem` (16px) | 400 | 1.5 | Default body text |
| Body S | `0.875rem` (14px) | 500 | 1.43 | Secondary info |
| Caption | `0.75rem` (12px) | 500 | 1.33 | Labels, metadata |

### Responsive Typography

```css
/* Hero Headline Responsive */
.hero-title {
  font-size: 3rem;        /* Mobile: 48px */
  line-height: 1.1;
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 4.5rem;    /* Tablet: 72px */
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 5rem;      /* Desktop: 80px */
  }
}
```

---

## 🧩 Component Patterns

### Buttons

#### Primary Button (Black)
```jsx
<button className="px-8 py-3 bg-black text-white rounded-full text-lg font-semibold hover:bg-gray-800 transition-all duration-300">
  Get started
</button>
```

**Specs:**
- Background: `black`
- Text: `white`
- Padding: `px-8 py-3` (32px horizontal, 12px vertical)
- Border Radius: `rounded-full`
- Font: `text-lg font-semibold`
- Hover: `bg-gray-800`

#### Secondary Button (Ghost)
```jsx
<button className="px-8 py-3 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition-all duration-300">
  Learn more
</button>
```

**Specs:**
- Background: `transparent`
- Text: `gray-900`
- Border: `1px solid gray-300`
- Hover: `bg-gray-100`

#### Animated Button with Arrow
```jsx
<Link className="flex justify-center gap-4 items-center shadow-xl text-lg bg-black text-white backdrop-blur-md font-semibold isolation-auto before:absolute before:w-full before:transition-all before:duration-700 before:hover:w-full before:-left-full before:hover:left-0 before:rounded-full before:bg-gray-800 hover:text-white before:-z-10 before:aspect-square before:hover:scale-150 before:hover:duration-700 relative z-10 px-8 py-3 overflow-hidden border-2 border-black rounded-full group">
  Get started
  <svg className="w-8 h-8 justify-end group-hover:rotate-90 group-hover:bg-white text-white ease-linear duration-300 rounded-full border border-white group-hover:border-gray-400 p-2 rotate-45" viewBox="0 0 16 19">
    <!-- Arrow path -->
  </svg>
</Link>
```

**Features:**
- Expanding background on hover
- Rotating arrow icon (45° → 90°)
- Gap between text and icon: `gap-4`
- Width: `px-8` (wider than standard)

### Cards

#### Feature Card
```jsx
<div className="group glass rounded-3xl p-8 border border-gray-200 cursor-pointer hover:translate-y-[-8px] transition-transform duration-200">
  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
    🏪
  </div>
  <h3 className="text-2xl font-bold mb-2 text-white">Title</h3>
  <p className="text-gray-400 leading-relaxed">Description</p>
</div>
```

**Specs:**
- Background: `.glass` utility class
- Padding: `p-8`
- Border: `border-gray-200` (light) or none on black bg
- Hover: Lifts up 8px
- Icon scales 110% on hover

#### Pricing Card
```jsx
<div className="glass rounded-3xl p-8 border border-gray-200">
  <h3 className="text-2xl font-bold mb-2">Plan Name</h3>
  <div className="mb-6">
    <span className="text-5xl font-bold">5,000</span>
    <span className="text-gray-500 ml-2">RWF/month</span>
  </div>
  <ul className="space-y-3 mb-8">
    <li className="flex items-center gap-3 text-gray-700">
      <span className="text-gray-900">✓</span>
      Feature
    </li>
  </ul>
  <button>Get started</button>
</div>
```

#### Popular Badge (Pricing)
```jsx
<div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black text-white text-xs font-bold">
  POPULAR
</div>
```

### Badges

#### Pill Badge
```jsx
<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass">
  <span className="w-2 h-2 rounded-full bg-gray-900 animate-pulse"></span>
  <span className="text-sm text-gray-600">Built for Rwandan entrepreneurs</span>
</div>
```

---

## 🎭 Visual Effects

### Glass Morphism

```css
.glass {
  backdrop-filter: blur(12px);
  background-color: rgba(243, 244, 246, 1); /* gray-100 */
  border: 1px solid rgba(229, 231, 235, 1); /* gray-200 */
}
```

**Usage:**
- Feature cards
- Pricing cards
- Badge backgrounds
- Floating elements

### Shadows

```css
/* Subtle shadow for cards */
box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);

/* Medium shadow for emphasis */
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);

/* Large shadow for modals */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
```

### Animations

#### Fade In Up
```javascript
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};
```

#### Stagger Children
```javascript
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

#### Pulse Animation
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

#### Infinite Scroll (Marquee)
```jsx
<motion.div
  animate={{ x: [0, -1400] }}
  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
>
  {/* Content */}
</motion.div>
```

---

## 📐 Spacing & Layout

### Container Widths

```css
.max-w-7xl { max-width: 80rem; }  /* 1280px */
.max-w-5xl { max-width: 64rem; }  /* 1024px */
.max-w-4xl { max-width: 56rem; }  /* 896px */
.max-w-3xl { max-width: 48rem; }  /* 768px */
.max-w-2xl { max-width: 42rem; }  /* 672px */
```

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `px-6` | 24px | Page horizontal padding |
| `py-4` | 16px | Button vertical padding |
| `py-12` | 48px | Small section padding |
| `py-24` | 96px | Medium section padding |
| `py-32` | 128px | Large section padding |
| `gap-3` | 12px | Small element gaps |
| `gap-6` | 24px | Medium element gaps |
| `gap-12` | 48px | Large element gaps |
| `mb-8` | 32px | Section title margin |
| `mb-16` | 64px | Large bottom margin |

### Responsive Breakpoints

```css
/* Tailwind Breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

### Grid Layouts

```css
/* Feature Grid (Responsive) */
.grid {
  display: grid;
  gap: 1.5rem; /* 24px */
}

@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 🎨 Section Patterns

### White Section
```jsx
<section className="relative max-w-7xl mx-auto px-6 py-32">
  {/* Content */}
</section>
```

### Black Section
```jsx
<section className="relative px-6 py-32 bg-black">
  <div className="max-w-7xl mx-auto">
    {/* Content - use white/gray text */}
  </div>
</section>
```

### Gray Section (Alternate)
```jsx
<section className="relative py-32 border-y border-gray-200 bg-gray-50">
  <div className="max-w-5xl mx-auto px-6">
    {/* Content */}
  </div>
</section>
```

---

## 🚫 Don't Use

### Deprecated Patterns

❌ **Colored Gradients**
```css
/* DO NOT USE */
background: linear-gradient(to-br, from-lime-500, to-purple-500);
```

❌ **Colored Glow Effects**
```css
/* DO NOT USE */
box-shadow: 0 0 40px rgba(196, 244, 93, 0.3);
```

❌ **Animated Gradient Orbs**
```jsx
{/* DO NOT USE */}
<div className="bg-gradient-to-r from-lime-500/20 to-purple-500/20 blur-3xl" />
```

❌ **Colored Card Borders**
```css
/* DO NOT USE */
border: 1px solid rgba(196, 244, 93, 0.2);
```

### Keep It Simple

✅ Use black and white
✅ Use simple borders (gray)
✅ Use subtle shadows
✅ Use clean typography
✅ Use minimal animations

---

## 📱 Responsive Design

### Mobile-First Approach

Always design for mobile first, then enhance for larger screens:

```jsx
<h1 className="text-5xl md:text-7xl lg:text-8xl">
  {/* Mobile: 3rem, Tablet: 4.5rem, Desktop: 5rem */}
</h1>
```

### Touch Targets

Minimum touch target size: **44px × 44px**

```jsx
<button className="px-6 py-3"> {/* At least 48px height */}
  Click me
</button>
```

---

## ♿ Accessibility

### Color Contrast

- Text on white: Use `gray-900` or darker (21:1 ratio)
- Text on black: Use `white` or `gray-100` (21:1 ratio)
- Secondary text: At least 4.5:1 ratio

### Focus States

```css
.button:focus {
  outline: 2px solid black;
  outline-offset: 2px;
}
```

### Semantic HTML

✅ Use proper heading hierarchy (h1 → h2 → h3)
✅ Use `<button>` for actions
✅ Use `<Link>` for navigation
✅ Include alt text for images
✅ Use ARIA labels when needed

---

## 📝 Code Standards

### Naming Conventions

- **Components**: PascalCase (`FeatureCard`, `PricingSection`)
- **Files**: PascalCase for components (`Home.jsx`, `Button.jsx`)
- **CSS Classes**: kebab-case or Tailwind utilities
- **Variables**: camelCase (`fadeInUp`, `staggerContainer`)

### File Structure

```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── styles/         # Global styles
├── utils/          # Helper functions
└── index.css       # Main stylesheet
```

---

## 📊 Changelog

### 2025-12-29 - Initial Design System

**Added:**
- ✅ Pure black and white color palette
- ✅ Inter font family
- ✅ Component patterns (buttons, cards, badges)
- ✅ Glass morphism utility
- ✅ Animation patterns with Framer Motion
- ✅ Responsive spacing and layout guidelines
- ✅ Section patterns (white, black, gray)

**Removed:**
- ❌ Lime green accent color (#c4f45d)
- ❌ All colored gradients (purple, blue, pink, yellow)
- ❌ Colored glow effects
- ❌ Gradient text
- ❌ Animated background orbs
- ❌ Dashboard preview graphic

**Modified:**
- 🔄 Hero title line-height reduced to 1.1
- 🔄 Get started button: increased width (px-8) and gap (gap-4)
- 🔄 Logo Marquee and Features sections: black backgrounds
- 🔄 Feature cards: updated for black background compatibility

---

## 🔄 Future Considerations

### Items to Explore
- [ ] Custom icon set (replace emojis with monochrome icons)
- [ ] Dark mode toggle (if needed beyond black sections)
- [ ] Loading states and skeletons
- [ ] Error states and validation
- [ ] Form input patterns
- [ ] Modal/dialog patterns
- [ ] Navigation patterns (if multi-page)
- [ ] Animation performance optimization

---

## 📚 Resources

- **Typography**: [Inter Font](https://fonts.google.com/specimen/Inter)
- **Animation**: [Framer Motion Docs](https://www.framer.com/motion/)
- **CSS Framework**: [Tailwind CSS v4](https://tailwindcss.com)
- **Accessibility**: [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

> **Note**: This is a living document. As we build more features and learn what works best, update this guide to reflect our learnings. Always add entries to the Changelog section when making significant changes.
