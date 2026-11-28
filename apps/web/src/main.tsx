import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider, createBrowserRouter } from 'react-router';
import { routes } from './app/routes.tsx';
import { removePrerenderedHead } from './seo/seo.ts';
import './styles/global.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root is missing from index.html');

// The static HTML carries the page's head tags for search engines; React renders its own set from
// here on (and keeps it right after a language or page change), so drop the static copy (#151).
removePrerenderedHead(document);

createRoot(container).render(
  <StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </StrictMode>,
);

// The app has started: fade the first-load splash out, then remove it.
const splash = document.getElementById('boot-splash');
if (splash) {
  requestAnimationFrame(() => splash.classList.add('boot-splash--done'));
  splash.addEventListener('animationend', () => splash.remove(), { once: true });
  window.setTimeout(() => splash.remove(), 1000);
}
