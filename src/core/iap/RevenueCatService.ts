import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesOfferings,
  type PurchasesPackage
} from "react-native-purchases";
import { getIapConfig, type IapConfig } from "@/core/config/iapConfig";

/**
 * RevenueCatService — thin infrastructure wrapper around the RevenueCat SDK.
 *
 * Holds no business logic and exposes only the calls the data layer needs.
 * When no public API key is configured the service is a no-op: `isConfigured`
 * is false and `configure()` returns early, so the app degrades to a fully
 * locked (but non-crashing) premium state instead of faking entitlements.
 */
class RevenueCatServiceImpl {
  private readonly config: IapConfig;
  private configured = false;
  private configuring: Promise<void> | null = null;

  constructor(config: IapConfig = getIapConfig()) {
    this.config = config;
  }

  get isConfigured(): boolean {
    return this.config.apiKey !== null;
  }

  /** Initialize the SDK exactly once. Safe to await repeatedly. */
  async configure(): Promise<void> {
    if (!this.isConfigured || this.configured) return;
    if (this.configuring) return this.configuring;

    this.configuring = (async () => {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      // apiKey is non-null here (guarded by isConfigured).
      Purchases.configure({ apiKey: this.config.apiKey as string });
      this.configured = true;
    })();

    try {
      await this.configuring;
    } finally {
      this.configuring = null;
    }
  }

  private ensureConfigured(): void {
    if (!this.configured) {
      throw new Error("RevenueCat is not configured");
    }
  }

  async getCustomerInfo(): Promise<CustomerInfo> {
    this.ensureConfigured();
    return Purchases.getCustomerInfo();
  }

  async getOfferings(): Promise<PurchasesOfferings> {
    this.ensureConfigured();
    return Purchases.getOfferings();
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
    this.ensureConfigured();
    const result = await Purchases.purchasePackage(pkg);
    return result.customerInfo;
  }

  async restore(): Promise<CustomerInfo> {
    this.ensureConfigured();
    return Purchases.restorePurchases();
  }

  /** Subscribe to entitlement changes pushed by the store. */
  onCustomerInfoUpdate(listener: CustomerInfoUpdateListener): void {
    if (!this.isConfigured) return;
    Purchases.addCustomerInfoUpdateListener(listener);
  }
}

export type RevenueCatService = RevenueCatServiceImpl;
export const revenueCat: RevenueCatService = new RevenueCatServiceImpl();
