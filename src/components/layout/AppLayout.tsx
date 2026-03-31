import React from "react";
import { TopNav } from "./TopNav";
type AppLayoutProps = {
  children: React.ReactNode;
  container?: boolean;
  className?: string;
  contentClassName?: string;
};
export function AppLayout({ children, container = false, className, contentClassName }: AppLayoutProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      <main className={`pt-16 ${className || ''}`}>
        {container ? (
          <div className={"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12" + (contentClassName ? ` ${contentClassName}` : "")}>
            {children}
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}