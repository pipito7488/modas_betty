// app/layout.tsx
import './globals.css';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import SessionProvider from '@/app/components/SessionProvider';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export const metadata = {
  title: 'Betty Modas - Elegancia Atemporal',
  description: 'Descubre colecciones exclusivas de moda. Sofisticación y calidad en cada prenda.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}