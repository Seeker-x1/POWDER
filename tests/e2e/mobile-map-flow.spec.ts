import { test, expect, type Page } from "@playwright/test";

type LocalePack = {
  html: string;
  toMap: RegExp;
  filterBtn: RegExp;
  closeFilter: RegExp;
  dates: [string, string, string];
  listBtn: RegExp;
};

const JA: LocalePack = {
  html: "/ski-powder-hunter.html",
  toMap: /マップで全ゲレンデを見る/,
  filterBtn: /^絞込$/,
  closeFilter: /^閉じる$/,
  dates: ["今日", "明日", "4日後"],
  listBtn: /^一覧$/,
};

const EN: LocalePack = {
  html: "/ski-powder-hunter-en.html",
  toMap: /View all resorts on map/i,
  filterBtn: /^Filter$/,
  closeFilter: /^Close$/,
  dates: ["Today", "Tomorrow", "+4d"],
  listBtn: /^List$/,
};

async function enterMap(page: Page, pack: LocalePack) {
  await page.goto(pack.html, { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: pack.toMap }).click();
  const viewMap = page.locator("#view-map");
  await expect(viewMap).toBeVisible();
  await expect(viewMap).toHaveClass(/map-state-idle/);
  await expect(page.locator("#map-zoom-in")).toBeVisible({ timeout: 20_000 });
  await page.waitForTimeout(300);
}

async function openFilter(page: Page, pack: LocalePack) {
  await page.locator("#map-filter-btn").click();
  const overlay = page.locator("#map-search-overlay");
  await expect(overlay).toHaveClass(/is-open/);
  await expect(overlay).toBeVisible();
}

test.describe("mobile map flows (JA)", () => {
  const pack = JA;

  test("1) map idle — map-first chrome", async ({ page }) => {
    await enterMap(page, pack);
    const stack = page.locator("#map-mock009-stack");
    await expect(stack).toBeVisible();
    const mapStage = page.locator(".map-stage");
    const mapBox = await mapStage.boundingBox();
    const stackBox = await stack.boundingBox();
    expect(mapBox).toBeTruthy();
    expect(stackBox).toBeTruthy();
    expect(mapBox!.height).toBeGreaterThan(stackBox!.height * 0.8);
    await expect(page.locator("#map-search-overlay")).toBeHidden();
    await expect(page.locator("#view-map .search-fab")).toBeHidden();
  });

  test("2) date rail — today / tomorrow / +4d", async ({ page }) => {
    await enterMap(page, pack);
    const rail = page.locator("#map-date-btns .date-card");
    await expect(rail).toHaveCount(3);
    for (const label of pack.dates) {
      const card = rail.filter({ hasText: label });
      await card.click();
      await expect(card).toHaveClass(/is-active/);
    }
  });

  test("3) filter overlay open/close", async ({ page }) => {
    await enterMap(page, pack);
    await expect(page.locator("#map-search-overlay")).toBeHidden();
    await openFilter(page, pack);
    await page.locator("#map-search-overlay-close").click();
    const overlay = page.locator("#map-search-overlay");
    await expect(overlay).not.toHaveClass(/is-open/);
    await page.waitForTimeout(350);
    await expect(overlay).toBeHidden();
  });

  test("4) JMA radios in filter panel OFF/3h/6h", async ({ page }) => {
    await enterMap(page, pack);
    await openFilter(page, pack);
    const panel = page.locator("#jma-toggle-mobile");
    await expect(panel).toBeVisible();
    for (const value of ["3h", "6h", ""]) {
      await panel.locator(`input[name="jma-snow-kind"][value="${value}"]`).click({ force: true });
      await expect(
        panel.locator(`input[name="jma-snow-kind"][value="${value}"]`)
      ).toBeChecked();
    }
    await page.locator("#map-search-overlay-close").click();
  });

  test("5) pin select → detail sheet → close", async ({ page }) => {
    await enterMap(page, pack);
    await page.evaluate(() => {
      // @ts-expect-error app globals
      if (typeof selectResort === "function") selectResort(1, { noMove: true });
    });
    const sheet = page.locator("#map-detail-sheet");
    await expect(sheet).toHaveClass(/map-detail-sheet--open/);
    await expect(page.locator("#view-map")).toHaveClass(/map-state-resort-selected/);
    await page.locator("#map-detail-scrim").click({ position: { x: 20, y: 20 } });
    await expect(sheet).not.toHaveClass(/map-detail-sheet--open/);
    await expect(page.locator("#view-map")).toHaveClass(/map-state-idle/);
  });

  test("6) back to ranking list", async ({ page }) => {
    await enterMap(page, pack);
    await page.getByRole("button", { name: pack.listBtn }).click();
    await expect(page.locator("#view-top")).toBeVisible();
    await expect(page.locator("#view-map")).toBeHidden();
  });
});

test.describe("mobile map flows (EN)", () => {
  const pack = EN;

  test("7) EN equivalent journey", async ({ page }) => {
    await enterMap(page, pack);
    await expect(page.locator("#map-date-btns .date-card")).toHaveCount(3);
    await openFilter(page, pack);
    await page.locator('#jma-toggle-mobile input[value="3h"]').click({ force: true });
    await page.locator("#map-search-overlay-close").click();
    await page.evaluate(() => {
      // @ts-expect-error app globals
      if (typeof selectResort === "function") selectResort(1, { noMove: true });
    });
    await expect(page.locator("#map-detail-sheet")).toHaveClass(/map-detail-sheet--open/);
    await page.locator(".map-detail-sheet__close--floating").click();
    await page.getByRole("button", { name: pack.listBtn }).click();
    await expect(page.locator("#view-top")).toBeVisible();
  });
});
