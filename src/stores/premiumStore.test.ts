describe("premiumStore debug toggle", () => {
  const setup = () => {
    jest.resetModules();
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
      ({ usePremium } =
        jest.requireActual<typeof import("./premiumStore")>("./premiumStore"));
    });

    return { usePremium: usePremium!, premiumGatewayMock };
  };

  test("free all-access keeps premium enabled when entitlement is false", async () => {
    const { usePremium } = setup();

    usePremium.setState({ entitlementPremium: false, isPremium: false });
    usePremium.getState().setDebugPremiumEnabled(true);
    expect(usePremium.getState().isPremium).toBe(true);

    usePremium.getState().setDebugPremiumEnabled(false);
    expect(usePremium.getState().isPremium).toBe(true);
    expect(usePremium.getState().activePlan).toBe("lifetime");
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

  test("hydrate keeps free all-access without calling billing", async () => {
    const { usePremium, premiumGatewayMock } = setup();

    await usePremium.getState().hydrate();

    expect(premiumGatewayMock.configure).not.toHaveBeenCalled();
    expect(premiumGatewayMock.refresh).not.toHaveBeenCalled();
    expect(usePremium.getState().isPremium).toBe(true);
    expect(usePremium.getState().activePlan).toBe("lifetime");
  });

  test("startTrial is a no-op in free all-access mode", async () => {
    const { usePremium, premiumGatewayMock } = setup();

    await expect(usePremium.getState().startTrial("annual")).resolves.toBeNull();

    expect(premiumGatewayMock.startTrial).not.toHaveBeenCalled();
    expect(usePremium.getState().isPremium).toBe(true);
  });
});
