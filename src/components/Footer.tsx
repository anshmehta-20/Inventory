// import React from 'react';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="container mx-auto px-4 py-2 text-center">
        <p className="text-sm text-muted-foreground">© {year} Shreeji Foods. All rights reserved.</p>
      </div>
    </footer>
  );
}
