import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <div className="page">
      <title>Page not found · Theonetrust.in</title>
      <h1>Page not found</h1>
      <p>The page you are looking for does not exist or has moved.</p>
      <p lang="ta">நீங்கள் தேடும் பக்கம் இல்லை அல்லது மாற்றப்பட்டுள்ளது.</p>
      <Link to="/">Go to the home page</Link>
    </div>
  );
}
