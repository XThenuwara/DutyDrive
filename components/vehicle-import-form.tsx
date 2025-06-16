import { formatCurrency, formatNumberWithCommas, formatReadable } from "@/lib/utils";
import { type TaxRatesData, type Currency, type VehicleType, type TaxRateEntry } from "@/types/tax";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { NumericInput } from "@/components/ui/numeric-input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface VehicleImportFormProps {
  selectedCurrency: Currency;
  selectedModel: string;
  vehicleType: VehicleType;
  engineCapacity: number;
  vehicleValue: number;
  currentRate: number;
  freightCharges: number;
  insuranceCharges: number;
  isLoadingRate: boolean;
  currentTaxBracket: TaxRateEntry | null;
  xidTaxRate: number;
  xidTaxTotal: number;
  taxRatesData: TaxRatesData;
  palTax: number;
  palTaxPercentage: number;
  isPalTaxEnabled: boolean;
  onCurrencyChange: (currency: Currency) => void;
  onModelChange: (model: string) => void;
  onVehicleTypeChange: (type: VehicleType) => void;
  onEngineCapacityChange: (capacity: number) => void;
  onVehicleValueChange: (value: number) => void;
  onCurrentRateChange: (rate: number) => void;
  onXidTaxRateChange: (rate: number) => void;
  onFreightChargesChange: (charges: number) => void;
  onInsuranceChargesChange: (charges: number) => void;
  onRefreshRate: () => void;
  onPalTaxChange: (tax: number) => void;
  onPalTaxPercentageChange: (percentage: number) => void;
  onPalTaxEnabledChange: (enabled: boolean) => void;
  actualRate?: number;
  isXidRateManual: boolean;
  onResetXidRate: () => void;
}

export function VehicleImportForm(props: VehicleImportFormProps) {
  const parseNumberFromCommas = (value: string) => {
    return Number.parseFloat(value.replace(/,/g, "")) || 0;
  };

  return (
    <div className="space-y-6 border rounded-md">
      <Accordion type="single" collapsible defaultValue="vehicle-details">
        <AccordionItem value="calculation-model">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Calculation Model & Currency</span>
              <span className="text-sm text-muted-foreground">
                {props.taxRatesData.models[props.selectedModel].name} • {props.taxRatesData.supportedCurrencies[props.selectedCurrency].name} • Rate: <span className="font-semibold text-black dark:text-white">{props.currentRate}</span>
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
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

            <div className="space-y-2">
              <Label htmlFor="currentRate" className="flex items-center gap-2">
                Current Exchange Rate ({props.selectedCurrency} to LKR)
                <Button type="button" variant="ghost" size="sm" onClick={props.onRefreshRate} disabled={props.isLoadingRate} className="h-6 w-6 p-0">
                  <RefreshCw className={`h-3 w-3 ${props.isLoadingRate ? "animate-spin" : ""}`} />
                </Button>
              </Label>
              <Input id="currentRate" type="number" step="0.001" value={props.currentRate || ""} onChange={(e) => props.onCurrentRateChange(Number(e.target.value))} />
              <p className="text-xs text-zinc-500">{props.actualRate ? `Actual Rate : (${formatCurrency(props.actualRate)}) + 0.05%` : ""}</p>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="vehicle-details">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Vehicle Details</span>
              <span className="text-sm text-muted-foreground">
                {props.vehicleType} • <span className="font-semibold text-black dark:text-white">{props.engineCapacity}cc</span> • <span className="font-semibold text-black dark:text-white">{formatCurrency(props.vehicleValue)}</span> {props.taxRatesData.supportedCurrencies[props.selectedCurrency].symbol}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
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
                  <NumericInput id="engineCapacity" value={props.engineCapacity} onChange={props.onEngineCapacityChange} placeholder="e.g., 1000" />
                  {props.currentTaxBracket && (
                    <p className="text-xs text-slate-500 mt-1">
                      Tax Bracket: {props.currentTaxBracket.description} ({props.currentTaxBracket.hsCode || "N/A"})
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleValue">Vehicle Value (in {props.taxRatesData.supportedCurrencies[props.selectedCurrency].name})</Label>
                <NumericInput id="vehicleValue" value={props.vehicleValue} onChange={props.onVehicleValueChange} placeholder={`e.g., 2,500,000 ${props.taxRatesData.supportedCurrencies[props.selectedCurrency].symbol}`} />
                {props.vehicleValue > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Base value: {formatCurrency(props.vehicleValue * props.currentRate)} ({formatReadable(props.vehicleValue * props.currentRate)})
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="charges">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex flex-col items-start text-left">
              <span className="font-medium">Charges & Taxes</span>
              <span className="text-sm text-muted-foreground">
                XID: <span className="font-semibold text-black dark:text-white">{formatCurrency(props.xidTaxTotal)}</span> • Freight: <span className="font-semibold text-black dark:text-white">{formatCurrency(props.freightCharges)}</span> • Insurance: <span className="font-semibold text-black dark:text-white">{formatCurrency(props.insuranceCharges)}</span> • PAL: {props.isPalTaxEnabled ? <span className="font-semibold text-black dark:text-white">{props.palTaxPercentage}%</span> : 'Disabled'}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="xidTaxRate" className="flex items-center gap-2">
                    XID Tax Rate {props.currentTaxBracket?.ratePerUnit ? "(per unit)" : "(per cc)"}
                    {props.isXidRateManual && <span className="text-xs text-slate-500">(Manual)</span>}
                  </Label>
                  <div className="flex gap-2">
                    <Input id="xidTaxRate" type="number" step="0.01" value={props.xidTaxRate || ""} onChange={(e) => props.onXidTaxRateChange(Number(e.target.value))} placeholder={props.isXidRateManual ? "Enter XID tax rate" : "Auto-calculated based on vehicle type and CC"} className={props.isXidRateManual ? "border-blue-500" : ""} />
                    {props.isXidRateManual && (
                      <Button type="button" variant="outline" size="icon" onClick={props.onResetXidRate} className="h-10 w-10" title="Reset to auto-calculation">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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
                  <NumericInput id="rateCharges" value={props.freightCharges} onChange={props.onFreightChargesChange} placeholder="e.g., 50,000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="insuranceCharges">Insurance Charges (LKR)</Label>
                  <NumericInput id="insuranceCharges" value={props.insuranceCharges} onChange={props.onInsuranceChargesChange} placeholder="e.g., 25,000" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="palTaxEnabled">Enable PAL %</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => props.onPalTaxEnabledChange(!props.isPalTaxEnabled)} className="relative h-10 w-10 px-3">
                      <div className={cn("h-2 w-2 rounded-full", props.isPalTaxEnabled ? "bg-green-500" : "bg-slate-400")} />
                    </Button>
                    <NumericInput id="palTaxPercentage" value={props.palTaxPercentage} onChange={props.onPalTaxPercentageChange} placeholder="e.g., 10" disabled={!props.isPalTaxEnabled} className={cn("transition-opacity", !props.isPalTaxEnabled && "opacity-50")} />
                  </div>
                  {props.palTax > 0 && (
                    <p className="text-xs text-slate-500 mt-1">
                      PAL Tax Total: {formatCurrency(props.palTax)} ({formatReadable(props.palTax)})
                    </p>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
