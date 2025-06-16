import { formatCurrency, formatNumberWithCommas, formatReadable } from "@/lib/utils"
import { type TaxRatesData, type Currency, type VehicleType, type TaxRateEntry } from "@/types/tax"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { NumericInput } from "@/components/ui/numeric-input"

interface VehicleImportFormProps {
  selectedCurrency: Currency
  selectedModel: string
  vehicleType: VehicleType
  engineCapacity: number
  vehicleValue: number
  currentRate: number
  freightCharges: number
  insuranceCharges: number
  isLoadingRate: boolean
  currentTaxBracket: TaxRateEntry | null
  xidTaxRate: number
  xidTaxTotal: number
  taxRatesData: TaxRatesData
  palTax: number
  palTaxPercentage: number
  onCurrencyChange: (currency: Currency) => void
  onModelChange: (model: string) => void
  onVehicleTypeChange: (type: VehicleType) => void
  onEngineCapacityChange: (capacity: number) => void
  onVehicleValueChange: (value: number) => void
  onCurrentRateChange: (rate: number) => void
  onFreightChargesChange: (charges: number) => void
  onInsuranceChargesChange: (charges: number) => void
  onRefreshRate: () => void
  onPalTaxChange: (tax: number) => void
  onPalTaxPercentageChange: (percentage: number) => void
  actualRate?: number
}

export function VehicleImportForm(props: VehicleImportFormProps) {
  const parseNumberFromCommas = (value: string) => {
    return Number.parseFloat(value.replace(/,/g, "")) || 0
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <Label htmlFor="modelSelect">Calculation Model</Label>
          <Select value={props.selectedModel} onValueChange={props.onModelChange}>
            <SelectTrigger id="modelSelect">
              <SelectValue placeholder="Select calculation model" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(props.taxRatesData.models).map(([key, model]) => (
                <SelectItem key={key} value={key}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currencySelect">Currency</Label>
          <Select value={props.selectedCurrency} onValueChange={(value) => props.onCurrencyChange(value as Currency)}>
            <SelectTrigger id="currencySelect">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(props.taxRatesData.supportedCurrencies).map(([code, currency]) => (
                <SelectItem key={code} value={code}>
                  {currency.name} ({currency.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={props.vehicleType} onValueChange={(value) => props.onVehicleTypeChange(value as VehicleType)}>
              <SelectTrigger id="vehicleType">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Hybrid">Hybrid</SelectItem>
                <SelectItem value="NonHybrid">Non-Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="engineCapacity">Engine Capacity (cc)</Label>
            <NumericInput
              id="engineCapacity"
              value={props.engineCapacity}
              onChange={props.onEngineCapacityChange}
              placeholder="e.g., 1000"
            />
            {props.currentTaxBracket && (
              <p className="text-xs text-slate-500 mt-1">
                Tax Bracket: {props.currentTaxBracket.description} ({props.currentTaxBracket.hsCode || "N/A"})
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehicleValue">
            Vehicle Value (in {props.taxRatesData.supportedCurrencies[props.selectedCurrency].name})
          </Label>
          <NumericInput
            id="vehicleValue"
            value={props.vehicleValue}
            onChange={props.onVehicleValueChange}
            placeholder={`e.g., 2,500,000 ${props.taxRatesData.supportedCurrencies[props.selectedCurrency].symbol}`}
          />
          {props.vehicleValue > 0 && (
            <p className="text-xs text-slate-500 mt-1">
              Base value: {formatCurrency(props.vehicleValue * props.currentRate)} ({formatReadable(props.vehicleValue * props.currentRate)})
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currentRate" className="flex items-center gap-2">
              Current Exchange Rate ({props.selectedCurrency} to LKR)
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={props.onRefreshRate}
                disabled={props.isLoadingRate}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${props.isLoadingRate ? "animate-spin" : ""}`} />
              </Button>
            </Label>
            <Input
              id="currentRate"
              type="number"
              step="0.001"
              value={props.currentRate || ""}
              onChange={(e) => props.onCurrentRateChange(Number(e.target.value))}
            />
            <p className="text-xs text-zinc-500">
                {props.actualRate ? `Actual Rate : (${formatCurrency(props.actualRate)}) + 0.05%` : ""}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="xidTaxRate">
              XID Tax Rate {props.currentTaxBracket?.ratePerUnit ? "(per unit)" : "(per cc)"}
            </Label>
            <Input
              id="xidTaxRate"
              type="text"
              value={props.xidTaxRate ? formatNumberWithCommas(props.xidTaxRate) : ""}
              placeholder="Auto-calculated based on vehicle type and CC"
              readOnly
            />
            {props.xidTaxRate > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                XID Tax Total: {formatCurrency(props.xidTaxTotal)} ({formatReadable(props.xidTaxTotal)})
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="rateCharges">Freight Charges (LKR)</Label>
            <NumericInput
              id="rateCharges"
              value={props.freightCharges}
              onChange={props.onFreightChargesChange}
              placeholder="e.g., 50,000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="insuranceCharges">Insurance Charges (LKR)</Label>
            <NumericInput
              id="insuranceCharges"
              value={props.insuranceCharges}
              onChange={props.onInsuranceChargesChange}
              placeholder="e.g., 25,000"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="palTaxPercentage">PAL Tax Percentage</Label>
            <NumericInput
              id="palTaxPercentage"
              value={props.palTaxPercentage}
              onChange={props.onPalTaxPercentageChange}
              placeholder="e.g., 10"
            />
            {props.palTax > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                PAL Tax Total: {formatCurrency(props.palTax)} ({formatReadable(props.palTax)})
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}