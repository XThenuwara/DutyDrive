export type Currency = "JPY" | "USD" | "EUR"
export type VehicleType = "Hybrid" | "NonHybrid"

export interface TaxRateEntry {
  hsCode: string
  description: string
  minCC: number
  maxCC: number
  yearLimit: string
  ratePerCC: number | null
  ratePerUnit: number | null
  ltx: boolean
  vat: boolean
}

export interface TaxModel {
  name: string
  description: string
  cifRate: number
  vatRate: number
  luxuryTax: Record<VehicleType, { threshold: number; rate: number }>
  xidRates: Record<VehicleType, TaxRateEntry[]>
}

export interface TaxRatesData {
  models: Record<string, TaxModel>
  supportedCurrencies: Record<Currency, {
    name: string
    symbol: string
  }>
}