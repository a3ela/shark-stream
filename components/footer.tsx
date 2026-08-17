export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-(--border-color) bg-(--bg-glass) backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-(--text-secondary)">
        <span>&copy; {new Date().getFullYear()} Shark Stream</span>
        <span>All rights reserved</span>
      </div>
    </footer>
  );
}
