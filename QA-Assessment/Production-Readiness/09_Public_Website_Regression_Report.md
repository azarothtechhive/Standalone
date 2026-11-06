# Public Website Regression Report — Azaroth Tech-Hive

## 1. Executive Summary
This report summarizes the regression testing performed on the public website. The site was validated across desktop and mobile viewports, confirming that all public routes are accessible, responsive, and free of critical UI defects.

## 2. Tested Routes
- **Public Routes:** Home, About, Products, Product Details, Services, Portfolio, Technology Insights, Insight Details, Testimonials, Connect, Privacy Policy, Terms of Service.
- **Header/Footer:** Navigation, responsive mobile drawer, social links, contact info, and copyright.
- **Functionality:** 404 behavior, responsive layout (1920px, 1440px, 1024px, 768px, 390px), HTTPS redirects, and interactive components (sliders, FAQ, Contact Form).

## 3. Findings
- **Responsiveness:** All pages conform to design requirements without horizontal overflow.
- **Content:** CMS-connected sections correctly display dynamic content.
- **Navigation:** All permanent redirects (301) function as expected.
- **HTTPS:** Always Use HTTPS enforced via Cloudflare and Vercel, no redirect loops.

## 4. Conclusion
The public website is stable, responsive, and ready for deployment.
