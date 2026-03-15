import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteShell } from "../SiteShell";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock analytics (noop)
vi.mock("@/lib/analytics", () => ({
  trackPhoneClick: vi.fn(),
  trackWhatsAppClick: vi.fn(),
  trackEmailClick: vi.fn(),
}));

// Mock next/dynamic to render component synchronously
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<unknown>) => {
    let Component: React.ComponentType | null = null;
    loader().then((mod: Record<string, unknown>) => {
      Component = (mod.Footer || mod.default) as React.ComponentType;
    });
    return function DynamicComponent(props: Record<string, unknown>) {
      if (!Component) return null;
      return <Component {...props} />;
    };
  },
}));

describe("SiteShell", () => {
  it("renders children content", () => {
    render(
      <SiteShell>
        <div data-testid="child-content">Hello World</div>
      </SiteShell>
    );
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Hello World")).toBeInTheDocument();
  });

  it("renders Header with logo", () => {
    render(
      <SiteShell>
        <p>Page content</p>
      </SiteShell>
    );
    expect(screen.getByText("IMPERIAL")).toBeInTheDocument();
  });

  it("does not render PromoPopup", () => {
    render(
      <SiteShell>
        <p>Page content</p>
      </SiteShell>
    );
    expect(screen.queryByText(/Book 4 Hours/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Get 1 FREE/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Maybe Later/i)).not.toBeInTheDocument();
  });

  it("wraps content in a main element", () => {
    render(
      <SiteShell>
        <p>Main content</p>
      </SiteShell>
    );
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toHaveTextContent("Main content");
  });
});
