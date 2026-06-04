# SartorCRM Client Admin

React + TypeScript port of the Sartor CRM HTML prototype (`Sartor CRM Client Admin Console v2.html`).

## Stack

- Vite 6, React 19, TypeScript
- React Router 7
- Chart.js, Leaflet / react-leaflet
- Mock data only (no backend)

## Scripts

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run preview
```

## Folder structure

```
src/
  components/
    ui/           # Reusable UI (Button, Badge, Card, Modal, tables, KPIs…)
    layout/       # Shell: role bar, sidebar, topbar
    charts/       # Dashboard & report charts
    location/     # Location pin cards
  constants/      # Nav, roles, tiers, routes
  context/          # App (role/tier), modals, toast, location
  data/mock.ts      # Sample CRM data
  hooks/            # Table filter, role gates
  modals/           # All dialogs grouped by domain
  pages/            # One file per route (27 pages)
  routes/           # React Router config
  styles/global.css # Design tokens & layout from prototype
  types/            # Shared TypeScript types
```

## Demo controls

Use the **Role** and **Tier** bars at the top to switch RBAC and feature gates — same behavior as the HTML prototype.
