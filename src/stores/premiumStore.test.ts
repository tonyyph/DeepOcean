describe("premiumStore debug toggle", () => {
  const setup = () => {
    jest.resetModules();
    (global as any).__DEV__ = true;

    const premiumGatewayMock = {
      isConfigured: true,
      cached: () => ({
        isPremium: false,
        unlockedThemes: [],
        activePlan: null,
        resolvedAt: 0
      }),
      activeTrial: () => null,
      configure: jest.fn(async () => {}),
      refresh: jest.fn(async () => ({
        isPremium: true,
        unlockedThemes: [],
        activePlan: "annual",
        resolvedAt: Date.now()
      })),
      purchaseLifetime: jest.fn(async () => ({
        isPremium: true,
        unlockedThemes: [],
        activePlan: "lifetime",
        resolvedAt: Date.now()
      })),
      purchaseAnnual: jest.fn(async () => ({
        isPremium: true,
        unlockedThemes: [],
        activePlan: "annual",
        resolvedAt: Date.now()
      })),
      purchaseMonthly: jest.fn(async () => ({
        isPremium: true,
        unlockedThemes: [],
        activePlan: "monthly",
        resolvedAt: Date.now()
      })),
      purchaseTheme: jest.fn(async () => ({
        isPremium: false,
        unlockedThemes: ["ice"],
        activePlan: null,
        resolvedAt: Date.now()
      })),
      restore: jest.fn(async () => ({
        isPremium: true,
        unlockedThemes: [],
        activePlan: "lifetime",
        resolvedAt: Date.now()
      })),
      startTrial: jest.fn(async () => null),
      validatePromoCode: jest.fn(async () => ({
        valid: false,
        reason: "not_found"
      }))
    };

    jest.doMock("@/data/container", () => ({
      container: {
        premium: premiumGatewayMock
      }
    }));

    jest.doMock("@/data/repositories/PremiumRepository", () => ({
      PurchaseCancelledError: class PurchaseCancelledError extends Error {}
    }));

    let usePremium: typeof import("./premiumStore").usePremium;
    jest.isolateModules(() => {
      usePremium = require("./premiumStore").usePremium;
    });

    return { usePremium: usePremium!, premiumGatewayMock };
  };

  test("setDebugPremiumEnabled toggles effective premium when entitlement is false", async () => {
    const { usePremium } = setup();

    usePremium.setState({ entitlementPremium: false, isPremium: false });
    usePremium.getState().setDebugPremiumEnabled(true);
    expect(usePremium.getState().isPremium).toBe(true);

    usePremium.getState().setDebugPremiumEnabled(false);
    expect(usePremium.getState().isPremium).toBe(false);
  });

  test("setDebugPremiumEnabled does not disable paid entitlement", async () => {
    const { usePremium } = setup();

    usePremium.setState({
      entitlementPremium: true,
      isPremium: true,
      debugPremiumEnabled: true
    });

    usePremium.getState().setDebugPremiumEnabled(false);
    expect(usePremium.getState().isPremium).toBe(true);
  });

  test("hydrate resolves gateway snapshot into store", async () => {
    const { usePremium, premiumGatewayMock } = setup();

    await usePremium.getState().hydrate();

    expect(premiumGatewayMock.configure).toHaveBeenCalled();
    expect(premiumGatewayMock.refresh).toHaveBeenCalled();
    expect(usePremium.getState().isPremium).toBe(true);
    expect(usePremium.getState().activePlan).toBe("annual");
  });
});
