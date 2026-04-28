/**
 * Attributes of tenants
 * @field apiToken: clients token. I.e, 'byxmNURedsgf5a4f6gwq3e5485gweds2vcq'
 * @field ecommerceId: Client ID. I.e,
 * {
 *   ecommerceId: "DEMO"
 * }
 */
export interface RedbookTenantsData {
  apiToken: string
  externalId?: {
    ecommerceId: string
  }
}

/**
 * This interface contains the configurations for Redbook tenants.
 * @field tenantsBaseUrl - Information needed to run the tenants endpoint. I.e,
 * "tenant/tenants?pageSize=10000"
 * @field environments - Configurations assigned by environment.
 */
export interface RedbookTenantsConfig {
  tenantsBaseUrl: string
  environments: {
    [key: string]: {
      baseUrl: string
      token: string
    }
  }
}
