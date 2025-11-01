import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

/**
 * DarkMode Component
 * 
 * A unified dark mode component that ensures consistent dark mode styling
 * across all components in the application.
 * 
 * Usage: Import and wrap your app or specific sections with this component.
 * It automatically applies dark mode CSS variables and classes.
 */

interface DarkModeProps {
  children: React.ReactNode;
  strict?: boolean; // When true, enforces dark mode styles more aggressively
}

export default function DarkMode({ children, strict = true }: DarkModeProps) {
  const { theme } = useTheme();

  useEffect(() => {
    // Apply dark mode class to html element for global effect
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      html.classList.add('dark');
      body.classList.add('dark');
      
      if (strict) {
        // Force dark mode styles on all elements
        html.style.colorScheme = 'dark';
        body.style.colorScheme = 'dark';
      }
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
      
      if (strict) {
        html.style.colorScheme = 'light';
        body.style.colorScheme = 'light';
      }
    }

    // Apply strict mode styling if enabled
    if (strict) {
      const style = document.createElement('style');
      style.id = 'darkmode-strict-styles';
      style.textContent = `
        .dark body {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }

        .dark h1,
        .dark h2,
        .dark h3,
        .dark h4,
        .dark h5,
        .dark h6,
        .dark p,
        .dark label {
          color: hsl(var(--foreground));
        }

        .dark input,
        .dark textarea,
        .dark select {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
        }

        .dark input::placeholder,
        .dark textarea::placeholder,
        .dark select::placeholder {
          color: hsl(var(--muted-foreground)) !important;
        }

        .dark code {
          background-color: hsl(var(--muted)) !important;
          color: hsl(var(--foreground)) !important;
        }

        .dark [role="dialog"],
        .dark [role="alertdialog"] {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
        }
      `;

      // Remove existing strict styles if any
      const existingStyle = document.getElementById('darkmode-strict-styles');
      if (existingStyle) {
        existingStyle.remove();
      }

      // Add new styles only in dark mode
      if (theme === 'dark') {
        document.head.appendChild(style);
      }

      return () => {
        const styleToRemove = document.getElementById('darkmode-strict-styles');
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, [theme, strict]);

  return <>{children}</>;
}

// Export a hook for easy access to dark mode state
export function useDarkMode() {
  const { theme, toggleTheme } = useTheme();
  
  return {
    isDark: theme === 'dark',
    theme,
    toggle: toggleTheme,
  };
}
