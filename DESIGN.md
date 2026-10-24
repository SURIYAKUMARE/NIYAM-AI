# NIYAM — Design System & Visual Architecture (Reference-First: StockWatch PHC Aligned)
**Project:** NIYAM — Institutional Application Validation & Regulatory Verification Platform (AICTE Problem Statement ID: 26261)  
**Visual Benchmark & Source of Truth:** `https://stockwatch-phc.vercel.app/`  
**Tooling / Standards:** Google Stitch Visual Direction, Tailwind CSS, WCAG 2.2 AA Accessibility  
**Revision:** v3.0 (Measured from live rendered reference)  
**Date:** October 24, 2026  

---

## 1. Reference Inspection Evidence & Visual Philosophy

On October 24, 2026, the live reference application at `https://stockwatch-phc.vercel.app/` was inspected across multiple viewports (1440x900 desktop, 375x812 mobile) using Playwright and Microsoft Edge. Exact computed styles, CSS utility classes, color values, element dimensions, and interaction states were extracted.

### Inspected Screens:
1. **Public Landing & Login Gateway (`stockwatch_desktop_1440.png`, `stockwatch_signin_modal_or_page.png`):**
   - High-contrast split-screen authentication layout. Left 55% deep teal branded presentation panel (`bg-gradient-to-br from-[#0F6B6B] to-[#0a4f4f]`) with subtle circular geometric overlays (`bg-white/5`), institutional feature checks, and statutory footer. Right 45% neutral canvas (`bg-[#F7F9FB]`) hosting an elevated white card (`bg-white rounded-2xl border border-[#E3E8EE] shadow-xl p-8`) with quick role selector pills, clean input groups, and an accessible eye toggle.
2. **Authenticated Application Shell (`stockwatch_app_shell_1440.png`):**
   - Fixed 256px (`w-64`) left sidebar with pure white surface (`#FFFFFF`), subtle right border (`#E3E8EE`), compact top branding area, and high-contrast vertical navigation items. Active item is styled with solid dark teal (`bg-[#0F6B6B] text-white rounded-lg shadow-sm`); inactive items use muted dark slate (`text-[#14202B] hover:bg-[#F7F9FB] hover:text-[#0F6B6B]`).
   - Sticky 56px (`h-14`) top header with 1px bottom border (`#E3E8EE`), live connection indicator badge (`bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold`), notification bell with count badge, circular user avatar (`w-7 h-7 rounded-full bg-[#0F6B6B] text-white`), user name and role title, and immediate sign-out action.
   - Main content canvas set to `#F7F9FB`, with a top context panel, horizontal workspace tabs with count badges, pale summary cards/stat strip (`bg-white p-4 rounded-lg border border-[#E3E8EE] shadow-xs`), search/filter controls (`h-10 pl-9 rounded-xl border-[#E3E8EE] bg-[#F7F9FB]`), and compact high-density data tables (`th` in `#F7F9FB`, `td` in `#FFFFFF` with `#E3E8EE` dividers).
3. **Mobile Layout (`stockwatch_mobile_375.png`):**
   - Left sidebar collapses off-canvas with a slide-over drawer triggered by header menu button.
   - All interactive touch targets measure $\ge 44 \times 44$ px with zero horizontal viewport scrolling (`scrollWidth === 375px`).

---

## 2. Measured Design Tokens & Palette

These measured values override earlier generic palette suggestions and serve as the binding contract for NIYAM's UI.

### 2.1 Core Palette Tokens
| Token Name | Reference Hex / CSS Value | RGB / Rendered Spec | Applied Role in NIYAM |
| :--- | :--- | :--- | :--- |
| **`bg-canvas`** | `#F7F9FB` | `rgb(247, 249, 251)` | Full page canvas background behind cards |
| **`surface`** | `#FFFFFF` | `rgb(255, 255, 255)` | Sidebar, header, workspace cards, dialogs, table rows |
| **`text-primary`** | `#14202B` | `rgb(20, 32, 43)` | Primary headings, table text, input text |
| **`text-secondary`**| `#5B6B7A` | `rgb(91, 107, 122)` | Secondary descriptions, column headers (`th`), captions |
| **`border`** | `#E3E8EE` | `rgb(227, 232, 238)` | 1px dividers, input borders, card outlines |
| **`accent-primary`**| `#0F6B6B` | `rgb(15, 107, 107)` | Active nav item, primary buttons, focus rings, brand badges |
| **`accent-hover`** | `#0a4f4f` | `rgb(10, 79, 79)` | Primary button hover state |
| **`accent-tint`** | `#E6F2F2` / `teal-50`| `rgb(230, 242, 242)` | Active tab highlight, quick role pill hover, tag backgrounds |

### 2.2 Semantic & Regulatory Status Tokens
| Regulatory State | Text & Icon Color | Background Tint | Border Tint | Usage in NIYAM |
| :--- | :--- | :--- | :--- | :--- |
| **Compliant / Verified** | `#047857` (Emerald 700) | `#ECFDF5` (Emerald 50) | `#A7F3D0` | Approved applications, verified credentials, passed rules |
| **Critical Deficiency** | `#B91C1C` (Red 700) | `#FEF2F2` (Red 50) | `#FECACA` | Expired NOCs, malware quarantine, rejected statutory orders |
| **Observation / Warning**| `#C2410C` (Orange 700) | `#FFF7ED` (Orange 50) | `#FED7AA` | Discrepancies, low OCR confidence, inspection required |
| **Gateway / Offline** | `#1D4ED8` (Blue 700) | `#EFF6FF` (Blue 50) | `#BFDBFE` | `SOURCE_UNAVAILABLE`, DigiLocker/Bharatkosh retry |
| **System Live / Online** | `#059669` (Emerald 600) | `#ECFDF5` | `#A7F3D0` | Live database & storage connection status in top header |

### 2.3 Typography Scale (Inter / Geist Aligned)
- **Font Family:** `Inter, system-ui, -apple-system, sans-serif` (UI prose & labels), `monospace` (SHA-256 hashes, timestamps, permanent application numbers).
- **Page Headings (`h1`):** `text-xl font-bold text-[#14202B]` (20px, line-height 28px).
- **Section Subtitles:** `text-xs text-[#5B6B7A]` (12px, line-height 16px).
- **Nav Links & Tabs:** `text-xs font-medium` (12px, line-height 16px).
- **Table Headers (`th`):** `text-xs font-semibold text-[#5B6B7A] bg-[#F7F9FB] uppercase tracking-wider`.
- **Table Cells (`td`):** `text-xs font-medium text-[#14202B]`.
- **Data Metric Numbers:** `text-base sm:text-lg font-bold tabular-nums text-[#0F6B6B]`.

---

## 3. Structural Component Blueprints

### 3.1 Application Shell (`AppShell.tsx`)
```
+---------------------------------------------------------------------------------------------------+
| SIDEBAR (w-64 / 256px, bg-white, border-r-[#E3E8EE])   | HEADER (h-14 / 56px, bg-white, border-b)  |
|                                                        | [Menu]  [Live DB/Storage]  [Bell]  [User] |
| [NIYAM Logo] NIYAM Institutional Platform              +-------------------------------------------+
| Subtitle: AICTE Regulation Bureau                      | CANVAS (bg-[#F7F9FB], p-6)                |
|                                                        |                                           |
| -- ROLE NAVIGATION (p-3 space-y-1) ------------------  | CONTEXT BAR:                              |
| [*] Overview / Dashboard (bg-[#0F6B6B] text-white)     | "Institutional Application Review"        |
| [ ] Applications Dossier                               | Subtitle + Action (New Application/Queue) |
| [ ] Document Checklist                                 +-------------------------------------------+
| [ ] AI Regulatory Findings                             | HORIZONTAL WORKSPACE TABS:                |
| [ ] Source Verification (DigiLocker/Bharatkosh)        | [Overview] [Docs (8)] [Findings (3)] ...  |
| [ ] Officer Scrutiny Queue                             +-------------------------------------------+
| [ ] Clarification & Queries                            | SUMMARY BAND (Grid 4-Cols):               |
| [ ] Tamper-Evident Audit Ledger                        | [Cards: bg-white border-[#E3E8EE] shadow] |
| [ ] Regulatory Rules                                   +-------------------------------------------+
|                                                        | WORKSPACE: Filters, Search, Table / View  |
| -- FOOTER / SESSION ---------------------------------  | [Search AICTE App ID...] [Filter Status]  |
| User Initials, Role Badge, Sign Out                    | [Table: th bg-[#F7F9FB], td bg-white]     |
+---------------------------------------------------------------------------------------------------+
```

### 3.2 Top Header Specifications
- **Container:** `h-14 px-4 lg:px-6 bg-white border-b border-[#E3E8EE] sticky top-0 z-30 flex items-center justify-between shadow-xs`.
- **Left Section:** Hamburger toggle for mobile (`lg:hidden text-[#5B6B7A]`), current section breadcrumb or quick statutory refresh button.
- **Right Section:**
  - **Live Connection Pill:** `hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200` with animated indicator dot (`w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse`).
  - **Notification Bell:** `p-1.5 rounded-lg text-[#5B6B7A] hover:bg-[#F7F9FB] relative` with badge count `absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center`.
  - **User Avatar & Metadata:** Circular avatar `w-7 h-7 rounded-full bg-[#0F6B6B] text-white text-xs font-bold flex items-center justify-center shadow-xs`. Text stack with user full name (`text-xs font-bold text-[#14202B]`) and designation/role (`text-[10px] text-[#5B6B7A]`).
  - **Logout Action:** Accessible icon button (`p-1.5 rounded-lg text-[#5B6B7A] hover:text-rose-600 hover:bg-rose-50 transition-colors`).

### 3.3 Horizontal Workspace Tabs
- **Container:** `flex items-center gap-1 border-b border-[#E3E8EE] px-4 pt-2 bg-white`.
- **Active Tab:** `px-3.5 py-2 text-xs font-semibold text-[#0F6B6B] border-b-2 border-[#0F6B6B] -mb-px flex items-center gap-2`.
- **Inactive Tab:** `px-3.5 py-2 text-xs font-medium text-[#5B6B7A] hover:text-[#14202B] hover:border-[#E3E8EE] border-b-2 border-transparent -mb-px flex items-center gap-2 transition-colors`.
- **Count Badge:** `px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3E8EE] text-[#5B6B7A]`.

### 3.4 Summary Band / Stat Cards
- **Grid Layout:** `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6`.
- **Card Container:** `bg-white p-4 rounded-lg border border-[#E3E8EE] shadow-xs hover:border-[#0F6B6B]/40 transition-colors`.
- **Top Row:** Title in `text-xs font-medium text-[#5B6B7A]` alongside category icon in `p-1.5 rounded-md bg-[#F7F9FB] text-[#0F6B6B]`.
- **Metric Row:** Main figure in `text-xl font-bold tabular-nums text-[#14202B]` or `text-[#0F6B6B]`.
- **Sub-label:** `text-[11px] text-[#5B6B7A] mt-1 flex items-center gap-1`.

### 3.5 Login Experience (`/login`)
- **Desktop Split-Screen:**
  - **Left 50%:** Deep teal gradient `bg-gradient-to-br from-[#0F6B6B] to-[#0a4f4f] p-12 text-white flex flex-col justify-between relative overflow-hidden`.
  - **Branding Header:** White icon container (`w-11 h-11 rounded-xl bg-white p-0.5 shadow-sm`), "NIYAM" title (`text-lg font-bold tracking-tight`), "AICTE Institutional Compliance Platform" subtitle (`text-xs text-teal-200`).
  - **Value Pillars:** Checkmarked list (`lucide-check-circle-2 text-teal-300`) covering deterministic APH rule verification, DigiLocker/Bharatkosh authentication, dual-pane scrutiny workspace, and SHA-256 audit chaining.
  - **Statutory Footer:** AICTE Regulation Bureau · Official Administrative Portal · Problem Statement 26261.
  - **Right 50%:** Neutral canvas `bg-[#F7F9FB]` with centered card (`bg-white rounded-2xl border border-[#E3E8EE] shadow-xl p-8 max-w-md w-full`).
  - **Quick Role Selector Pills:** For rapid evaluation without password lookup: `Applicant`, `Scrutiny Officer`, `Supervising Authority`, `System Admin`, `Statutory Auditor`.
  - **Form Controls:** Clean input fields with leading outline icons, password visibility toggle, accessible labels, Supabase Auth integration, and official TOTP MFA verification.

---

## 4. Google Stitch Component Architecture

All UI components are organized under `frontend/src/components/stitch/` and wired directly to application state:
1. `StitchShell.tsx`: Responsive navigation shell hosting the left sidebar, top header, and page container.
2. `StitchHeader.tsx`: Slim 56px header with real database/storage health probe, notifications, user avatar, and logout.
3. `StitchSidebar.tsx`: Role-filtered vertical navigation with `#0F6B6B` active badge, collapse state, and session details.
4. `StitchContextPanel.tsx`: Standardized top context block with title, description, and primary CTA.
5. `StitchWorkspaceTabs.tsx`: Tab strip with active underline and live record count badges.
6. `StitchSummaryBand.tsx`: 4-card metric strip with tabular figures and semantic progress indicators.
7. `StitchDataTable.tsx`: Accessible table with sticky column headers, search input, filters, pagination, and empty state.
8. `StitchStatusBadge.tsx`: Pill badges matching the reference semantic palette.

---

## 5. Verification & Visual Parity Checklist

- [x] Canvas background measured and verified at `#F7F9FB`.
- [x] Surface cards verified at `#FFFFFF` with 1px border `#E3E8EE`.
- [x] Accent color confirmed at `#0F6B6B` with hover `#0a4f4f`.
- [x] Sidebar width locked to 256px (`w-64`) with active nav rounded-lg `#0F6B6B`.
- [x] Header height locked to 56px (`h-14`) with live connection indicator.
- [x] Login page dual-pane layout verified against reference screenshot.
- [x] Mobile drawer and 375px responsive behavior verified with zero overflow.
- [x] Full keyboard navigation and WCAG 2.2 AA focus indicators implemented.
