"use client";
export default function DashboardError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <div className="admin-page">
      <h1 className="admin-page__title">Couldn’t load the dashboard</h1>
      <p className="admin-page__subtitle">
        Please check your connection and try again.
      </p>
      <button className="admin-btn admin-btn--primary mt-6" onClick={retry}>
        Try again
      </button>
    </div>
  );
}
