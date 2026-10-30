import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout.tsx';
import { RouteErrorPage } from '../routes/error/RouteErrorPage.tsx';
import { HomePage } from '../routes/home/HomePage.tsx';
import { NotFoundPage } from '../routes/not-found/NotFoundPage.tsx';

/**
 * Route table shared by the browser router and tests.
 * Planned utility routes (see docs/website-plan.md): /donate, /receipt/:token,
 * /manage/:token, /help, /privacy, /terms, /refund-policy, /admin/*.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
