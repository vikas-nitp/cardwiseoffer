# Z-index scale

Use the existing Tailwind layers consistently:

- `z-0`–`z-10`: page decoration and local content.
- `z-20`–`z-30`: sticky header, local autocomplete controls, and mobile navigation.
- `z-40`: autocomplete results that must clear page content.
- `z-50`: dialogs, sheets, drawers, dropdowns, popovers, and overlays.
- `z-[60]`: search/card selectors that intentionally render above standard overlays.
- `z-[100]`: toast notifications only.

New components should reuse these layers rather than introduce a larger arbitrary value. A component that requires a new layer must document which existing overlay it needs to cross.
