 Phase 4: Navigation & Structure

     4.1 Create Hub Pages for Main Sections

     - Create new pages:
       - /tenders - Hub for all tender browsing options
       - /resources - Hub for guides, blog, FAQ
       - /categories - Hub for all category pages
     - Each hub: Links to sub-pages with descriptions
     - Impact: Better information architecture

     4.2 Expand Header Navigation

     - File: src/app/layout.tsx
     - Add dropdown menus:
       - Browse: Latest, Closing Soon, Opportunities, Categories
       - Resources: How It Works, Blog, FAQ, Glossary
       - Keep: Search, Provinces, Alerts, About
     - Impact: Improved discoverability

     4.3 Add Breadcrumbs Throughout Site

     - Add to pages missing breadcrumbs:
       - /opportunities/page.tsx
       - /latest/page.tsx
       - /blog/[slug]/page.tsx
       - All category pages
       - All province pages
     - Impact: Better navigation, SEO boost

     Phase 5: Error Handling & Security

     5.1 Create Custom Error Pages

     - Create:
       - src/app/error.tsx - General error boundary
       - src/app/401.tsx or middleware redirect - Unauthorized
       - src/app/403.tsx or middleware redirect - Forbidden
     - Style: Match not-found.tsx pattern with helpful messaging
     - Impact: Better UX for errors, prevent security probing

     5.2 Handle Non-existent Routes

     - Update: Middleware or add catch-all route
     - Block: Common attack patterns (wp-admin, setup-config.php)
     - Log: Security events separately
     - Impact: Better security posture

     Phase 6: Engagement Features

     6.1 Site-Wide Notification Bar

     - Create: src/components/NotificationBar.tsx
     - Features:
       - Dismissible (localStorage tracking)
       - Admin-editable content (from DB or env var)
       - Default: "Beta version - Best viewed on desktop"
       - Sticky at top
     - Add to: src/app/layout.tsx
     - Impact: Important announcements, user guidance

     6.2 Live User Counter (FOMO Element)

     - Create: src/components/LiveUserCounter.tsx
     - Features:
       - Simulated random count (e.g., 120-180 range)
       - Subtle fluctuation animation
       - Place in header or notification bar
       - Text: "X businesses currently browsing"
     - Impact: Social proof, urgency

     Implementation Order (Recommended)

     Week 1: Phase 1 (Quick Fixes) + Phase 5.1 (Error Pages)
     Week 2: Phase 2 (Typography) + Phase 3.1 (Action Buttons)
     Week 3: Phase 4 (Navigation) + Phase 6.1 (Notification Bar)
     Week 4: Phase 3.2-3.3 (Sidebar blur, height) + Phase 6.2 (User Counter) + Testing

     Key Decisions Needed

     1. Sidebar Blur: Should entire sidebar be blurred or just specific metrics? Show "Upgrade" CTA or "Sign Up"?
     2. User Counter: What number range feels credible? (suggest 80-200)
     3. Notification Bar: Admin panel for editing or environment variable for now?
     4. Save Tender: Require login or allow anonymous saves (localStorage)?
     5. Typography: Stick with current font (Inter?) or switch as per style guide?

     Testing Requirements

     - Mobile responsiveness (320px to 1440px+)
     - Breadcrumb SEO validation
     - Typography contrast ratios (WCAG AA)
     - Error page handling
     - Button functionality across browsers
     - Performance impact of new components