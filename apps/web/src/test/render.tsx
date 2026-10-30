import { render, type RenderResult } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, type RouteObject } from 'react-router';
import { routes as appRoutes } from '../app/routes.tsx';

/** Renders the real route table at a given URL using an in-memory router. */
export function renderRoute(path: string, routes: RouteObject[] = appRoutes): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries: [path] });
  return render(<RouterProvider router={router} />);
}
