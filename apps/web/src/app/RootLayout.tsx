import { Outlet } from 'react-router';

/** Minimal public shell. Header, nav, language switch and footer arrive in issue #11. */
export function RootLayout() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
