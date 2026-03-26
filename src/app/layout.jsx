import './globals.css';

export const metadata = {
  title: 'Retro Revival — Inventory Manager',
  description: 'Inventory, dispatch & finance tracking for Retro Revival',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
