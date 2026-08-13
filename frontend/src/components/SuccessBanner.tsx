import './ui.css';

export function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="ui-success-banner" role="status">
      {message}
    </p>
  );
}
