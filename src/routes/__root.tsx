import { createRootRoute, HeadContent, Outlet, Scripts, useRouterState } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { DeskShell, StoreShell } from "@/components/layout";
import appCss from "../styles.css?url";

const APP_NAME = "Bricksplaza";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: APP_NAME },
      {
        name: "description",
        content:
          "Bricksplaza — clay masonry, hard landscaping and specialist systems. 2,044 SKUs, Gauteng & KZN yards, nationwide freight. A division of Besbpo Group.",
      },
      { name: "theme-color", content: "#26211E" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap",
      },
    ],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-[11px] uppercase tracking-[0.2em] text-clay">404</p>
      <h1 className="mt-2 font-display text-4xl">That page isn’t in the yard</h1>
      <p className="mt-3 text-mortar">Try search, or go back to the catalogue.</p>
      <a href="/" className="mt-6 inline-block text-clay">
        Home
      </a>
    </div>
  ),
  component: RootDocument,
});

function RootDocument() {
  return (
    <html lang="en-ZA" className="antialiased" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className="bg-cream text-kiln">
        <PreviewHostBridge />
        <AuthProvider>
          <Shell />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  );
}

function Shell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname.startsWith("/login") || pathname.startsWith("/forgot-password")) {
    return <Outlet />;
  }
  if (pathname.startsWith("/desk")) {
    return (
      <DeskShell>
        <Outlet />
      </DeskShell>
    );
  }
  return (
    <StoreShell>
      <Outlet />
    </StoreShell>
  );
}
