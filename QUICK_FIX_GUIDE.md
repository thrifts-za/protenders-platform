# Quick Fix Guide for Remaining Pages

## Problem
Pages fail at build time because they call `searchTenders()` server-side with relative URLs.

## Solution Pattern (copy from /tenders/closing-today)
1. Keep metadata and header sections as-is (server-side)
2. Replace tender data loading section with:
```tsx
<LiveTendersFiltered
  filters={{ /* API params */ }}
  emptyIcon={/* icon component */}
  emptyTitle="Title"
  emptyDescription="Description"  
  emptyAction={/* optional JSX */}
/>
```

## Pages to Fix
- [ ] closing-this-week: filters={{ closingInDays: 7, page: 1, pageSize: 100 }}
- [ ] closing-this-month: filters={{ closingInDays: 30, page: 1, pageSize: 100 }}
- [ ] published-today: filters={{ publishedSince: "today ISO", page: 1, pageSize: 100 }}
- [ ] published-this-week: filters={{ publishedSince: "weekago ISO", page: 1, pageSize: 100 }}
- [ ] over-10-million: Make fully client component (custom filtering)
- [ ] 1-5-million: Make fully client component (custom filtering)
- [ ] sme-opportunities: Make fully client component (custom filtering)
