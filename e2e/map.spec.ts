import { expect, test, type Page } from "@playwright/test";

import { STORED_MAP_VIEW_KEY } from "../src/features/map/lib/mapStorageConstants";

type StoredMapView = {
  latitude: number;
  longitude: number;
  zoom: number;
};

async function readStoredMapView(page: Page) {
  const value = await page.evaluate(
    (storageKey) => window.localStorage.getItem(storageKey),
    STORED_MAP_VIEW_KEY
  );

  return value ? (JSON.parse(value) as StoredMapView) : null;
}

function expectStoredMapViewToMatch(
  actual: StoredMapView | null,
  expected: StoredMapView
) {
  expect(actual).not.toBeNull();
  expect(actual?.latitude).toBeCloseTo(expected.latitude, 5);
  expect(actual?.longitude).toBeCloseTo(expected.longitude, 5);
  expect(actual?.zoom).toBeCloseTo(expected.zoom, 2);
}

test("map mounts when IP location is unavailable and restores the last view", async ({
  page,
}) => {
  let geolocationRequests = 0;

  await page.route(/api\.maptiler\.com\/geolocation/i, async (route) => {
    geolocationRequests += 1;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await route.abort("failed");
  });

  try {
    await page.goto("/map", { waitUntil: "domcontentloaded" });

    const mapView = page.getByTestId("map-view");
    await expect(mapView.locator(".maplibregl-canvas")).toBeVisible({
      timeout: 10_000,
    });
    expect(await readStoredMapView(page)).toBeNull();

    await page.getByRole("button", { name: /zoom in/i }).click();

    await expect
      .poll(
        async () => {
          const storedView = await readStoredMapView(page);
          return storedView?.zoom ?? null;
        },
        { timeout: 5000 }
      )
      .toBeGreaterThan(1.5);
    const storedAfterMove = await readStoredMapView(page);
    expect(storedAfterMove).not.toBeNull();
    if (!storedAfterMove) throw new Error("Expected stored map view");

    await page.reload({ waitUntil: "domcontentloaded" });

    await expect(mapView.locator(".maplibregl-canvas")).toBeVisible({
      timeout: 10_000,
    });
    expectStoredMapViewToMatch(await readStoredMapView(page), storedAfterMove);

    await page.getByRole("button", { name: /zoom in/i }).click();
    await expect
      .poll(async () => {
        const storedView = await readStoredMapView(page);
        return storedView?.zoom ?? null;
      })
      .toBeGreaterThan(storedAfterMove.zoom + 0.5);
    const storedAfterRestoredZoom = await readStoredMapView(page);
    expect(storedAfterRestoredZoom?.latitude).toBeCloseTo(
      storedAfterMove.latitude,
      5
    );
    expect(storedAfterRestoredZoom?.longitude).toBeCloseTo(
      storedAfterMove.longitude,
      5
    );
    expect(storedAfterRestoredZoom?.zoom).toBeGreaterThan(
      storedAfterMove.zoom + 0.5
    );
    expect(geolocationRequests).toBeGreaterThanOrEqual(1);
  } finally {
    await page.unrouteAll({ behavior: "ignoreErrors" });
  }
});
