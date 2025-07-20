# Empathy Ledger Trusted Design System

## Design Philosophy

Building on research of trusted Australian technology brands (CSIRO, Red Cross, Beyond Blue, ABS), this design system prioritizes:

1. **Transparency First**: Every design decision supports openness
2. **Human-Centered**: Technology serves people, not vice versa
3. **Culturally Sensitive**: Respectful of diverse communities
4. **Ethically Grounded**: Visual ethics match data ethics

## Brand Personality

### Core Attributes

- **Trustworthy**: Like CSIRO's scientific credibility
- **Empathetic**: Like Beyond Blue's supportive presence
- **Empowering**: Like Red Cross's action-oriented approach
- **Intelligent**: Like ABS's data authority
- **Accessible**: Like DTA's inclusive government design

### Visual Tone

- Professional without being corporate
- Warm without being casual
- Modern without being trendy
- Minimal without being cold
- Australian without being exclusive

## Color System

### Primary Palette

Inspired by Australian landscapes and trusted institutions:

```css
:root {
  /* Trust & Stability */
  --primary-900: #003d7a; /* Deep Ocean - CSIRO inspired */
  --primary-700: #0747a6; /* Trust Blue - Primary actions */
  --primary-500: #0065cc; /* Active Blue - Interactive states */
  --primary-300: #579dff; /* Sky Blue - Highlights */
  --primary-100: #e9f2ff; /* Cloud Blue - Backgrounds */

  /* Empathy & Connection */
  --teal-700: #006b8f; /* Deep Teal - Secondary actions */
  --teal-500: #00b8d9; /* Connection Teal - Links, accents */
  --teal-300: #79e2f2; /* Light Teal - Hover states */
  --teal-100: #e6fcff; /* Mist - Subtle backgrounds */

  /* Human Warmth */
  --coral-700: #bf2600; /* Earth Red - Important actions */
  --coral-500: #ff5630; /* Human Coral - Alerts, CTAs */
  --coral-300: #ff8f73; /* Warm Peach - Gentle emphasis */
  --coral-100: #ffebe6; /* Blush - Soft highlights */

  /* Neutrals with Warmth */
  --gray-900: #091e42; /* Charcoal - Primary text */
  --gray-700: #253858; /* Storm - Secondary text */
  --gray-500: #5e6c84; /* Slate - Subtle text */
  --gray-300: #97a0af; /* Silver - Borders */
  --gray-100: #f4f5f7; /* Pearl - Backgrounds */
  --white: #ffffff; /* Pure White - Cards */

  /* Status Colors */
  --success: #00875a; /* Growth Green */
  --warning: #ff8b00; /* Alert Amber */
  --error: #de350b; /* Critical Red */
  --info: #0065cc; /* Information Blue */
}
```

### Color Usage Principles

1. **Blue for Trust**: Primary actions, security indicators
2. **Teal for Connection**: Links, network elements
3. **Coral for Humanity**: CTAs, human stories
4. **Grays for Content**: Text hierarchy, UI elements
5. **White Space**: Generous use for breathing room

## Typography System

### Font Stack

```css
:root {
  /* Headlines - Modern but approachable */
  --font-display: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Body - Highly legible */
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Data & Code - Distinctive */
  --font-mono: 'JetBrains Mono', 'Courier New', monospace;

  /* Special Accents - Trustworthy */
  --font-accent: 'Space Grotesk', -apple-system, sans-serif;
}
```

### Type Scale

```css
/* Desktop Sizes */
--text-7xl: 4.5rem; /* Hero headlines */
--text-5xl: 3rem; /* Page titles */
--text-3xl: 2rem; /* Section headers */
--text-xl: 1.25rem; /* Subsections */
--text-base: 1rem; /* Body text */
--text-sm: 0.875rem; /* Supporting text */
--text-xs: 0.75rem; /* Labels, metadata */

/* Line Heights */
--leading-tight: 1.25; /* Headlines */
--leading-normal: 1.5; /* Body text */
--leading-relaxed: 1.75; /* Reading content */

/* Font Weights */
--font-normal: 400; /* Body text */
--font-medium: 500; /* Emphasis */
--font-semibold: 600; /* Subheadings */
--font-bold: 700; /* Headlines */
```

## Component Patterns

### Trust Indicators

1. **Security Badge Component**

   ```
   [🔒 Lock Icon] + "Your data is encrypted" + [Learn more →]
   Background: --primary-100
   Border: 1px solid --primary-300
   Text: --primary-700
   ```

2. **Privacy Toggle Component**

   ```
   "Share my story: [Toggle]"
   "Who can see this: [Dropdown - You only | My community | Researchers]"
   Background: White with --gray-300 border
   Active state: --teal-500
   ```

3. **Partner Trust Bar**
   ```
   "Trusted by:" + [Partner logos in grayscale]
   On hover: Logos gain color
   Background: --gray-100
   ```

### Navigation Patterns

1. **Primary Navigation**
   - Sticky header with subtle shadow
   - Logo + 5-6 main items max
   - "Tell Your Story" CTA in --coral-500
   - Mobile: Hamburger to full-screen overlay

2. **Trust Navigation** (Footer)
   - Privacy Policy | Data Practices | Security | Contact
   - Always visible, --gray-700 on white

### Content Cards

1. **Story Card**

   ```
   [Circular photo] or [Initial avatar]
   Name (optional) or "Community Member"
   Location: "Brisbane, QLD"
   Preview: First 100 chars...
   [Read Story →] in --teal-500
   ```

2. **Impact Metric Card**
   ```
   [Large number] in --primary-700
   [Metric label] in --gray-700
   [Trend indicator] in --success or --error
   [Subtle background pattern]
   ```

### Interactive Elements

1. **Buttons**
   - Primary: --primary-700 background, white text, 8px radius
   - Secondary: White background, --primary-700 border and text
   - Danger: --coral-500 background for critical actions
   - Hover: Slight scale(1.02) and shadow increase

2. **Form Inputs**
   - 48px height for accessibility
   - --gray-300 border, --primary-500 on focus
   - Clear labels above inputs
   - Helper text in --gray-500

## Page Layouts

### Homepage Structure

```
1. Hero Section
   - Large headline: "Every Story Matters"
   - Subheading: "Share your experience. Shape your community."
   - Dual CTAs: "Tell Your Story" | "Explore Networks"
   - Background: Subtle animated network visualization

2. Trust Bar
   - "Protecting 10,000+ stories across Australia"
   - Security badges: Encryption | Privacy-first | Community-owned

3. Dual Value Proposition
   - Split screen:
     Left: Individual empowerment (portrait photo)
     Right: Network intelligence (visualization)

4. How It Works
   - 3-step visual process
   - Icons + short descriptions
   - "Learn More" links

5. Case Study Carousel
   - Large cards with images
   - Quotes from participants
   - Impact statistics

6. Call to Action
   - Full-width section
   - Gradient background (--primary-700 to --teal-700)
   - Clear next steps
```

### Trust Page Template

```
1. Header
   - Icon + "Trust & Security"
   - Breadcrumb navigation

2. Overview
   - Plain language commitment
   - Key principles as cards

3. Detailed Sections
   - Accordion-style expandables
   - Technical details available but not overwhelming

4. Certifications
   - Visual badges with explanations
   - Links to third-party validations

5. Contact
   - Direct line to privacy team
   - Response time commitment
```

## Animation Principles

### Motion Values

```css
/* Durations */
--duration-fast: 150ms; /* Micro-interactions */
--duration-normal: 250ms; /* Standard transitions */
--duration-slow: 400ms; /* Page transitions */

/* Easings */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Transforms */
--scale-hover: scale(1.02);
--scale-click: scale(0.98);
```

### Animation Uses

1. **Subtle Feedback**: Hover states, focus rings
2. **Smooth Transitions**: Page loads, accordions
3. **Meaningful Motion**: Network visualizations, data flows
4. **No Distractions**: Avoid decorative animations

## Responsive Approach

### Breakpoints

```css
--screen-sm: 640px; /* Mobile landscape */
--screen-md: 768px; /* Tablet portrait */
--screen-lg: 1024px; /* Tablet landscape */
--screen-xl: 1280px; /* Desktop */
--screen-2xl: 1536px; /* Wide desktop */
```

### Mobile-First Principles

1. **Touch Targets**: Minimum 44x44px
2. **Thumb Zones**: Critical actions in lower 2/3
3. **Simplified Navigation**: Progressive disclosure
4. **Performance**: Lazy load images, optimize fonts

## Accessibility Standards

### WCAG AA Compliance

1. **Color Contrast**: 4.5:1 minimum for body text
2. **Focus Indicators**: Visible keyboard navigation
3. **Screen Readers**: Semantic HTML, ARIA labels
4. **Reduced Motion**: Respect prefers-reduced-motion

### Inclusive Design

1. **Multiple Input Methods**: Mouse, keyboard, touch, voice
2. **Clear Language**: Plain English, avoid jargon
3. **Error Handling**: Clear, actionable error messages
4. **Flexible Text**: Scales up to 200% without breaking

## Cultural Sensitivity

### Indigenous Recognition

1. **Acknowledgment of Country**: Prominent on footer
2. **Visual Representation**: Respectful inclusion in imagery
3. **Cultural Protocols**: Warnings for deceased persons
4. **Language Options**: Support for Indigenous languages

### Multicultural Design

1. **RTL Support**: Arabic, Hebrew ready
2. **Character Sets**: Full Unicode support
3. **Cultural Colors**: Awareness of meanings
4. **Imagery**: Diverse, authentic representation

## Implementation Guidelines

### Component Development

1. **Atomic Design**: Build from atoms to organisms
2. **Storybook**: Document all components
3. **Design Tokens**: CSS variables for consistency
4. **Testing**: Visual regression + accessibility

### Brand Application

1. **Logo Usage**: Clear space, minimum sizes
2. **Co-branding**: Guidelines for partners
3. **Templates**: Email, social, documents
4. **Quality Control**: Review process

This design system creates a visual language that builds trust through transparency, consistency, and human-centered design while maintaining the sleek, minimal aesthetic requested.
