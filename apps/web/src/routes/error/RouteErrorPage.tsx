/**
 * Shown when a route throws. Deliberately uses a plain anchor (full reload)
 * so recovery works even if the router itself is in a bad state.
 * Never shows technical error details to the public.
 */
export function RouteErrorPage() {
  return (
    <main id="main" className="page">
      <title>Something went wrong · Theonetrust.in</title>
      <h1>Something went wrong</h1>
      <p role="alert">Please refresh the page or try again in a moment.</p>
      <p lang="ta">பக்கத்தைப் புதுப்பிக்கவும் அல்லது சிறிது நேரம் கழித்து முயற்சிக்கவும்.</p>
      <a href="/">Go to the home page</a>
    </main>
  );
}
