- [ ]  Sweeping through the website to make sure that we use product title in breadcrumbs, tender cards
- [ ]  Closing Soon 12 days remaining; this should be in a straight line not stacked or no line break
- [ ]  in tender details page, the 3 buttons don’t work, add to calender, save tender and share
- [ ]  let’s blur the content in the left side bar, so, blur out the body text. e.g.

### Strategic Assistant

Win Probability:

68% (you’ll blur 68%) to make people interested in knowing more and we’ll do that throughout the left side bar.

- [ ]  Handle 403 or 404 or all those non-existing pages ; i see on the logs that some people try to put URL directories that doesn’t exisit in the system to find the login pages and all.

Nov 09 07:02:46.12

**GET**

401

protenders-platform-6dzfhquf2-nkosis-projects-0cee20c5.vercel.app

/icons/apple-touch-icon.png

Nov 09 07:02:46.10

**GET**

401

protenders-platform-6dzfhquf2-nkosis-projects-0cee20c5.vercel.app

/icons/apple-touch-icon.png

Nov 09 07:02:45.20

**GET**

200

protenders-platform-6dzfhquf2-nkosis-projects-0cee20c5.vercel.app

/

Nov 09 07:01:41.23

**GET**

403

www.protenders.co.za

/wordpress/wp-admin/setup-config.php

- [ ]  The **Recently Published Tenders in the homepage, the cards are not the same as the ones we use in search and throughout the site, we need to update them. and these are not nicely and clean at all.**
- [ ]  This breadcrub structure is wrong (
1. [Home](https://www.protenders.co.za/)
2. [eTenders](https://www.protenders.co.za/etenders)
3. **AM:2025/NOV/06 (here, it needs to be the tender description for SEO purposes**

- [ ]  this section (

**Overview**

**Financial Intelligence**

**Competitive Analysis**

**Documents**

**Action Center**

**Real-time Updates**

**Award History)** it’s height needs to be inline with the height of the sidebar (right), always, meaning its adjust as per the height of the right sidebar.

- [ ]  We need a notifications bar right at the top top of the site that will show throughout the website. The notification bar’s content should be edited by the admin from the dashboard. The default announce should be something along the lines of, this is a (beta version, something along the lines of best viewed on desktop screens. not sure how we can do it.
- [ ]  Not Sure how we can do it, create FOMO from not using the website, but subtle execution though, part of this is to have live counter of how many users are on the site or businesses on the site, and this live counter is very random in its numbers, up and down it’s counting.
- [ ]  **Freshness:Last 7 daysLast 30 daysLast 90 daysAll timeUpdated since**

**Sort:**Latest (this top section needs to show everything in one row instead of the sort and reset filters being beneath as it is at the moment

- [ ]  The top header menu is missing some of the menu headings we’ve got at the footer. Each of those headings should be clickable to then open a main landing page which them has sub links linking to the options it offers main page will serve as a hub and then you can choose to navigate to the subpages (which are already created, the only thing new to create now is the hub page content)
- [ ]  It’s a very bad UI/UX experience where some of the content is ALL CAPS, others Title Case and others Sentence casing. more so on the tender cards or tender details pages, we need to keep consistent with sentence casing more so on the descriptions, body and so forth of the tender cards or detailed pages.
- [ ]  

## 🔤 **Typography Style Guide**

**For: [Your Website Name]**

**Goal:** Polished, scalable, consistent, and accessible typography system for all screen sizes.

---

### 📏 Font Scale & Sizes

### 📌 Type Scale (Based on 1.125 Major Third Modular Scale – Balanced for Web)

- **H1** – `36px` / `2.25rem` — Bold
- **H2** – `30px` / `1.875rem` — Bold
- **H3** – `24px` / `1.5rem` — Semibold
- **H4** – `20px` / `1.25rem` — Semibold
- **H5** – `18px` / `1.125rem` — Medium
- **H6** – `16px` / `1rem` — Medium

### ✅ Responsive Guidelines

- Use fluid typography (CSS `clamp()` or `@media` queries) to scale headings down gracefully on mobile.
- Avoid shrinking body text below 16px — hurts readability.

---

### 📝 Body Text

- **Font Size:** `16px` / `1rem` (Minimum standard)
- **Line Height:** `1.5` to `1.6` (24px to 26px)
- **Paragraph Spacing:** `1.25em` or 20px
- **Max Line Length:** ~60–75 characters (including spaces)
- **Font Weight:** 400 (Regular)

---

### 💪 Font Weight Rules

| Use Case | Weight |
| --- | --- |
| Headings | 600–700 (Semi/Bold) |
| Body Text | 400 (Regular) |
| Labels | 500–600 (Medium/Semi) |
| CTA Buttons | 600–700 (Semi/Bold) |
| Emphasis | 600 (Semi-bold) sparingly |
| Never | Use bold for entire paragraphs, links, or labels not meant to grab attention |

> Note: Don’t bold everything. If everything is bold, nothing stands out.
> 

---

### 🔠 Capitalization Rules

| Element | Capitalization | Example |
| --- | --- | --- |
| **Headings** | Title Case | “How to Improve Your UX” |
| **Subheadings** | Sentence case | “This is a supporting paragraph.” |
| **CTA Buttons** | Title Case | “Get Started” / “Learn More” |
| **Navigation** | Title Case | “Pricing”, “Features”, “About Us” |
| **Form Labels** | Sentence case | “Email address” |
| **Error Messages** | Sentence case | “This field is required.” |
| **All Caps** | Use *sparingly* and only when stylistically branded (e.g. footer nav or acronyms) — never for body copy or long labels |  |

---

### ⚙️ Font Family Setup (Example)

Choose based on brand tone. If not decided, here's a versatile pairing:

- **Primary Font (Sans-Serif):** `Inter`, `Helvetica Neue`, `Arial`, sans-serif
- **Fallback Font Stack:**
    
    ```css
    font-family: 'Inter', 'Helvetica Neue', 'Segoe UI', Roboto, sans-serif;
    
    ```
    

> Keep to one font family across UI unless there's a solid brand or content strategy reason to introduce a second.
> 

---

### ✅ Implementation Standards

- Use **rem/em units**, **not px** in CSS for scalability.
- Establish **base font size = 16px** (`html { font-size: 100%; }`)
- Set global `box-sizing: border-box;`
- Define a **type scale in your CSS/SCSS** system (tokens, variables, or utility classes).
- Maintain **consistent vertical rhythm** — spacing between elements should follow a pattern (e.g., multiples of 4 or 8px)

---

### 🔍 Accessibility Considerations

- **Contrast Ratio:** Minimum 4.5:1 for body text, 3:1 for large text (WCAG AA)
- **Don’t rely on font weight or color alone** to convey meaning
- Make sure text can be zoomed up to 200% without breaking layout

---

### 💡 Dev Handoff Summary

1. **CSS Variables / Tokens**
    
    ```css
    :root {
      --font-size-h1: 2.25rem;
      --font-size-h2: 1.875rem;
      --font-size-h3: 1.5rem;
      --font-size-h4: 1.25rem;
      --font-size-h5: 1.125rem;
      --font-size-h6: 1rem;
      --font-size-body: 1rem;
      --line-height-body: 1.6;
    }
    
    ```
    
2. **Utility Classes / Design Tokens**
    - `.text-h1`, `.text-body`, `.font-bold`, `.font-medium`
    - Create design system components or CSS utility classes to enforce type rules
3. **Apply Consistency via Design System**
    - Apply to all design files (Figma/XD/etc.)
    - Build reusable text components in your dev stack (React/Vue/etc.)

---

### 🧨 Common Mistakes to Avoid

- Mixing capitalization styles randomly
- Too many font weights (stick to 3 max: regular, medium, bold)
- Overusing bold or uppercase
- Small font sizes on mobile
- Inconsistent spacing between headings and paragraphs
- No visual hierarchy (everything looks the same = no scannability)

- [ ]  

## 💻 Optimal Layout Dimensions & Responsive Guidelines

### 📐 Breakpoints (Industry-Backed Standards)

| Device Type | Min-Max Width (px) | Breakpoint Label |
| --- | --- | --- |
| Mobile | 0 – 767 | `sm` |
| Tablet | 768 – 1023 | `md` |
| Small Desktop | 1024 – 1279 | `lg` |
| Large Desktop | 1280+ | `xl` |

> Tip: Use CSS clamp(), min(), and max() for fluid responsiveness, not just hard breakpoints.
> 

---

## 📏 Optimal Content Widths (Text-Focused)

- **Max Content Width (Desktop):** `65–75ch` (characters) — that's ~700–900px depending on font
- **Recommended Max-Width Container:**
    - `max-width: 720px` → Ideal for articles, blog posts
    - `max-width: 960px` → For layouts with sidebars or additional navigation
    - **Never** full width — it destroys line length and ruins readability

> Avoid letting body text stretch beyond ~75 characters per line — it fatigues the reader and kills scanability.
> 

---

## 📱 Mobile & Tablet Layout Behavior

- **Mobile (0–767px):**
    - Full-width content blocks (`padding: 16px 20px`)
    - Text-align: left, never center-align body content
    - Font sizes may drop, but not below `16px`
    - Collapse nav into hamburger or tab menu
    - Break up dense paragraphs and long lists
- **Tablet (768–1023px):**
    - Center content with horizontal margins (`padding: 24px 32px`)
    - Can support 2-column grids for things like TOCs, side quotes
    - Font size scale can begin ramping up to desktop sizes

---

## 🔠 Typographic Scaling & Spacing

### ➕ Type Scaling (Use `clamp()` for fluid type)

### Example (for body text):

```css
font-size: clamp(1rem, 1.2vw, 1.125rem);

```

### Example Scale:

| Element | Mobile | Desktop |
| --- | --- | --- |
| H1 | 32px | 48px |
| H2 | 28px | 36px |
| H3 | 24px | 30px |
| Body Text | 16px | 18px |

Use relative units (`rem`, `em`, `%`) instead of `px` in CSS wherever possible.

---

### 📏 Vertical Spacing System

Use a **4px or 8px base grid** — and stay consistent.

| Type Element | Margin Bottom |
| --- | --- |
| Headings | 16–24px |
| Paragraphs | 16px |
| List Items | 8–12px |
| Section Spacing | 32–64px |
| CTA / Button Gap | 24–32px |

> Rule of thumb: Let the design breathe — whitespace is not wasted space, it's structure.
> 

---

## 🧱 Layout Structure (Best Practice)

### 1. **Outer Container (Full Width)**

```css
width: 100%;
padding: 0 16px; // mobile
padding: 0 24px; // tablet
padding: 0 32px; // desktop

```

### 2. **Inner Content Wrapper**

```css
max-width: 720px; // articles
max-width: 960px; // general content
margin: 0 auto;

```

### 3. **Grid System (Optional)**

Use 12-column responsive grid system if you’re including sidebars, navs, etc.

---

## ✅ Final Execution Tips

- Use **CSS Grid or Flexbox** for layout — never float-based
- Don’t rely on media queries alone — build a fluid system using `clamp()` and `max-width`
- Define and reuse **design tokens** for spacing, font sizes, and breakpoints
- Test readability across 320px → 1440px screens
- Don’t just test in your dev tools — check on **real mobile devices**

---

## 🚫 Red Flags to Avoid

- Paragraphs running full width across screens = horrible UX
- Mobile font sizes below 16px
- Inconsistent margins between headings and content
- Over-nesting containers — adds CSS bloat and layout issues
- Over-reliance on screen size-specific hacks instead of fluid design

- [ ]  The info icon tooltip in the tender card, needs to be removed.
- [ ]  Across the entire website, need to make sure that there are breadcrumbs, throughout the entire site across all pages.
- [ ]  /opportunities is empty, and this shouldn’t be
- [ ]  /latest this is not wokring as welll, it just showing framework but not the actual data
- [ ]  let’s make **Recently Published Tenders in the homepage, instead of 2 columns, make 1 column**