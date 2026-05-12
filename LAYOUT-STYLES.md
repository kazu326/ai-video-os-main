# LAYOUT-STYLES.md
# 5 UI Style Definitions for AI Video OS
# Lazyweb MCP Reference: Use these styles as queries to ground design in real-world UI patterns

---

## STYLE 1: Notion-Style
### Lazyweb Query: "notion workspace page editor"

**Design Philosophy:** Document-first, calm hierarchy
**Cognitive Load:** Minimal - focus on content, not chrome

### Visual Characteristics
- Background: #FFFFFF (light) / #191919 (dark)
- Font: Inter, 16px body, generous line-height 1.7
- Layout: Single column, max-width 720px, centered
- Navigation: Left sidebar, collapsible, icon+text
- Cards: No border, subtle shadow, 8px radius
- Icons: Simple, monochrome
- Spacing: Generous whitespace, 24-32px sections

### UI Patterns
- Sidebar: 240px fixed, page hierarchy tree
- Breadcrumb: Top left, subdued
- Content blocks: Full-width, click-to-edit feel
- Checklist: Clean checkbox, strikethrough on complete
- Progress: Simple percentage text, no flashy bars
- Tables: Borderless, alternating light rows

### Interaction
- Hover: Very subtle bg change (#F7F7F7)
- Click: No animation, instant state change
- Focus: Thin blue outline

### Use Case for AI Video OS
- Best for: Reading documentation, working through SOP step by step
- Phase: All phases, especially solo operators

---

## STYLE 2: Linear-Style
### Lazyweb Query: "linear app issue tracker project management"

**Design Philosophy:** Dense, keyboard-first, command-driven
**Cognitive Load:** Low once learned - everything has a shortcut

### Visual Characteristics
- Background: #1A1A2E (dark, always)
- Accent: Violet #7C3AED, subtle purple tones
- Font: Inter, 14px, tight line-height 1.4
- Layout: Three-pane (nav + list + detail)
- Cards: Compact, border-left accent on active
- Icons: Precise, small 16px
- Spacing: Dense, 8-12px gaps

### UI Patterns
- Left nav: 200px, grouped sections with counts
- List view: Table-like rows, sortable columns
- Status badges: Color-coded pills (Todo/In Progress/Done)
- Priority: P0/P1/P2 visual indicators
- Command palette: Cmd+K always available
- Keyboard shortcuts: Visible on hover

### Interaction
- Hover: Smooth bg transition 150ms
- Selection: Bold accent border
- Drag: Reorderable items

### Use Case for AI Video OS
- Best for: Daily checklist execution, tracking video pipeline status
- Phase: Mid-phase when managing multiple videos in parallel

---

## STYLE 3: Obsidian-Style
### Lazyweb Query: "obsidian notes knowledge graph markdown editor"

**Design Philosophy:** Network thinking, connected knowledge
**Cognitive Load:** Moderate - rewards exploration

### Visual Characteristics
- Background: #1E1E1E (dark default)
- Accent: Magenta/Purple #9B59B6
- Font: Monospace for code, Serif for notes
- Layout: Flexible panes, resizable
- Cards: Markdown-rendered blocks
- Graph: Visual node connections
- Spacing: Compact but scannable

### UI Patterns
- Sidebar: Folder tree + tag cloud
- Backlinks: Always visible panel
- Graph view: Mini-map of connected pages
- Tags: #hashtag inline syntax
- Code blocks: Syntax highlighted
- Callouts: Colored info/warning/tip blocks

### Interaction
- Hover: Link preview popup
- Click: Smooth pane transition
- Search: Fuzzy, instant results

### Use Case for AI Video OS
- Best for: Seeing how concepts connect, exploring the mind map structure
- Phase: Strategy phase, building understanding of the whole system

---

## STYLE 4: Apple-Style
### Lazyweb Query: "apple ios settings app clean minimal"

**Design Philosophy:** Humanist, feels natural, zero friction
**Cognitive Load:** Ultra-low - self-explanatory

### Visual Characteristics
- Background: #F2F2F7 (light gray system bg)
- Cards: White #FFFFFF with strong shadow
- Accent: System Blue #007AFF
- Font: SF Pro / -apple-system, 17px
- Layout: Single column cards, full-width on mobile
- Radius: 12-16px rounded cards
- Spacing: 16px gutters, generous padding

### UI Patterns
- Section headers: Uppercase gray labels
- List cells: Full-width tap targets, chevron right
- Toggle: iOS-style switch
- Progress: Filled arc or linear bar
- Alerts: Center modal with blur backdrop
- Tabs: Bottom tab bar (mobile-first)

### Interaction
- Tap: Immediate feedback, slight scale
- Long press: Context menu
- Swipe: Reveal actions

### Use Case for AI Video OS
- Best for: Quick daily checklist on mobile, fast reference checks
- Phase: Early phase, when building habits

---

## STYLE 5: SaaS Dashboard-Style
### Lazyweb Query: "saas analytics dashboard metrics overview"

**Design Philosophy:** Data-forward, at-a-glance insight
**Cognitive Load:** Higher - dense info, requires training

### Visual Characteristics
- Background: #0F172A (dark navy)
- Cards: #1E293B with 1px border #334155
- Accent: Cyan #06B6D4, Green #22C55E, Red #EF4444
- Font: Inter, 13-14px, mixed weights
- Layout: Grid (12-col), cards of varying sizes
- Charts: Line, bar, donut charts
- Spacing: 16px grid, compact

### UI Patterns
- KPI cards: Large number, trend arrow, sparkline
- Top nav: Logo + search + avatar
- Sidebar: Icon-only (collapsed default)
- Data table: Sortable, filterable, exportable
- Status: Real-time dots (live/offline)
- Filters: Chip-based, date range picker

### Interaction
- Hover: Tooltip with full data
- Click: Drill-down to detail
- Animate: Numbers count up on load

### Use Case for AI Video OS
- Best for: Weekly analysis review, performance data, improvement decisions
- Phase: All phases, especially analysis cadence

---

## Codex Implementation Instructions

When generating each style variant:
1. Load Lazyweb MCP first: `lazyweb search [style-specific query]`
2. Reference 3-5 real screens from results for spacing/color validation
3. Apply the CSS variables defined above
4. Use the same HTML data structure, only change CSS/layout
5. Ensure all 8 core features work in each variant
6. Test: Can a new user find the daily checklist in <5 seconds?
7. Test: Can they complete a SOP step without scrolling back?

## Cognitive Load Reduction Rules (All Styles)
- Max 3 actions visible at any time
- Current step always highlighted
- Completed = visually distinct (not just grayed)
- Never show future steps in full detail
- Phase indicator always visible
- One primary CTA per screen
