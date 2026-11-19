# Porting scripts

Used once to bring the HTML prototype (`PIL---GIRS`) into this project; kept so the steps can be repeated.

| Script | What it does |
| --- | --- |
| `port_pages.py <prototype dir>` | Prototype screens → view-models (`*Model.ts`), data modules and TSX views. Static inline styles become Tailwind classes (`css2tw.py`). |
| `port_styles.py <prototype dir> --screens-only` | Screen stylesheets, scoped with `:where(.pg-…)` inside `@layer components`. |
| `css_apply.py <files…>` | Rewrites rules as Tailwind `@apply` where every declaration maps exactly to utilities. |
| `tpl2jsx.py`, `css2tw.py`, `scope_css.py` | Template → JSX, CSS → Tailwind classes, CSS scoping (used by the scripts above). |

After running them: `npm run format`. `src/styles/base.css` and the shell components are maintained by hand.
