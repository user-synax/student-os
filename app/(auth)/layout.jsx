export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative z-10">
      {children}
    </div>
  );
}
