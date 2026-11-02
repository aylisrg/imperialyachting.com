import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MaterialsPanel } from "../MaterialsPanel";
import { SITE_CONFIG } from "@/lib/constants";
import type { SaleMaterialSummary } from "@/types/sale";

const items: SaleMaterialSummary[] = [{
  id: "brochure",
  title: "Specification (PDF)",
  description: "Current brochure",
  category: "brochure",
  kind: "file",
  sizeBytes: 1000,
  fileCount: 1,
}];
const emailLabel = "Your email — we send a copy of the links there";
const gtag = vi.fn();

beforeEach(() => {
  localStorage.clear();
  gtag.mockReset();
  window.gtag = gtag;
});

afterEach(() => {
  cleanup();
  delete window.gtag;
  vi.unstubAllGlobals();
});

describe("Material pack email-form analytics", () => {
  it.each(["monte-carlo-6-moneta", "vandutch-40-van-dutch-connect"])(
    "records the intentional opening once for %s, without personal data",
    (slug) => {
      const panel = () => <StrictMode><MaterialsPanel slug={slug} items={items} /></StrictMode>;
      const { rerender } = render(panel());
      expect(gtag).not.toHaveBeenCalled();
      expect(screen.queryByLabelText(emailLabel)).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Download 1 file" }));
      expect(screen.getByLabelText(emailLabel)).toBeInTheDocument();
      expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "sales_material_form_open", {
        yacht_slug: slug,
        send_to: SITE_CONFIG.googleAnalyticsId,
      });

      rerender(panel());
      fireEvent.change(screen.getByLabelText(emailLabel), { target: { value: "private@example.com" } });
      fireEvent.click(screen.getByRole("checkbox", { name: "I'm a broker" }));
      fireEvent.change(screen.getByPlaceholderText("Brokerage (optional)"), { target: { value: "Private Company" } });
      fireEvent.change(screen.getByPlaceholderText("Register client (optional)"), { target: { value: "Private Client" } });
      expect(gtag).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(gtag.mock.calls)).not.toMatch(/private@example|Private Company|Private Client/);
    }
  );

  it("does not count disabled selection or a remembered profile until the form opens", () => {
    localStorage.setItem("imperial_sales_profile", JSON.stringify({
      email: "remembered@example.com", isBroker: true, company: "Remembered Company",
    }));
    render(<MaterialsPanel slug="monte-carlo-6-moneta" items={items} />);
    expect(gtag).not.toHaveBeenCalled();
    expect(screen.queryByLabelText(emailLabel)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    const disabledDownload = screen.getByRole("button", { name: "Download" });
    expect(disabledDownload).toBeDisabled();
    fireEvent.click(disabledDownload);
    expect(gtag).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Select all" }));
    fireEvent.click(screen.getByRole("button", { name: "Download 1 file" }));
    expect(screen.getByLabelText(emailLabel)).toHaveValue("remembered@example.com");
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(gtag.mock.calls)).not.toContain("remembered@example.com");
  });

  it("deduplicates repeated clicks before the email-form transition commits", () => {
    render(<MaterialsPanel slug="monte-carlo-6-moneta" items={items} />);
    const download = screen.getByRole("button", { name: "Download 1 file" });
    act(() => {
      download.click();
      download.click();
    });
    expect(screen.getByLabelText(emailLabel)).toBeInTheDocument();
    expect(gtag).toHaveBeenCalledTimes(1);
  });

  it("counts reopening after a completed download, but not submit or returning to selection", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, files: [] }),
    }));
    render(<MaterialsPanel slug="vandutch-40-van-dutch-connect" items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Download 1 file" }));
    fireEvent.change(screen.getByLabelText(emailLabel), { target: { value: "customer@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: "Download now" }));
    await waitFor(() => expect(screen.getByText("Download started")).toBeInTheDocument());
    expect(gtag).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Download something else" }));
    expect(gtag).toHaveBeenCalledTimes(1);
    expect(screen.queryByLabelText(emailLabel)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Download 1 file" }));
    expect(screen.getByLabelText(emailLabel)).toHaveValue("customer@example.com");
    expect(gtag).toHaveBeenCalledTimes(2);
  });

  it("still opens the email form when the existing analytics runtime is unavailable", () => {
    delete window.gtag;
    render(<MaterialsPanel slug="monte-carlo-6-moneta" items={items} />);
    fireEvent.click(screen.getByRole("button", { name: "Download 1 file" }));
    expect(screen.getByLabelText(emailLabel)).toBeInTheDocument();
    expect(gtag).not.toHaveBeenCalled();
  });
});
