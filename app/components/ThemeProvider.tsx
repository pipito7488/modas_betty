// components/ThemeProvider.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { type ThemeProviderProps } from 'next-themes/dist/types';

export function ThemeProvider({ children,...props }: ThemeProviderProps) {
  // forceTheme="light" asegura que en el servidor renderice light
  // y luego se sincronice en el cliente, evitando el FOUC.[15]
  return <NextThemesProvider {...props} attribute="class">{children}</NextThemesProvider>;
}