import './ui.css';

export function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="ui-error-banner" role="alert">
      {message}
    </p>
  );
}
