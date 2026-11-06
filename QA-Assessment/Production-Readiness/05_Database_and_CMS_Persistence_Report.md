# Database and CMS Persistence Report — Azaroth Tech-Hive

## 1. Executive Summary
This report documents the verification and implementation of durable persistence using Neon PostgreSQL for the Azaroth Tech-Hive application. The database schema enforces least-privilege roles, Row Level Security (RLS), atomic publishing via PL/pgSQL functions, and robust media asset versioning.

## 2. Schema Architecture & Migrations
- **Migration 001 (`001_roles_and_schema.sql`):** Establishes database roles (`azaroth_migrator`, `azaroth_app`, `azaroth_public_ro`), core identity/session tables, content documents, publish attempts, revisions, media assets/versions, audit logs, and form submissions.
- **Migration 002 (`002_rls_policies.sql`):** Implements Row Level Security policies and public read-only views (`v_published_content`) to isolate draft and published content.
- **Migration 003 (`003_publish_and_restore_functions.sql`):** Implements PL/pgSQL functions for atomic publishing (`fn_commit_publish`), revision restoration (`fn_restore_revision_to_draft`), and asset version management.

## 3. CMS Persistence Verification
- All CMS content (settings, navigation, products, services, portfolio, insights, testimonials, and page content) maps directly to the `content_documents` and related relational tables.
- Draft vs. published content separation is fully enforced at the database level, ensuring that edits in the CMS do not affect the public site until explicitly published.
- Revision history is retained (up to 20 revisions per scope) enabling seamless rollback and restoration.

## 4. Conclusion
The Neon PostgreSQL database architecture provides robust, secure, and transactional persistence for the Azaroth Tech-Hive application, meeting all P0/P1 production requirements.
