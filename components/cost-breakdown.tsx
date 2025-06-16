import { formatCurrency, formatReadable, formatNumberWithCommas } from "@/lib/utils";
import { type TaxModel, type VehicleType, type TaxRateEntry } from "@/types/tax";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface CostBreakdownProps {
  cifValue: number;
  cidTax: number;
  xidTaxTotal: number;
  luxuryTax: number;
  totalWithoutVat: number;
  vat: number;
  totalCost: number;
  selectedModel: TaxModel;
  vehicleType: VehicleType;
  engineCapacity: number;
  xidTaxRate: number;
  currentTaxBracket: TaxRateEntry | null;
  palTax: number;
  palTaxPercentage: number;
  isPalTaxEnabled: boolean;
  taxRatesData: {
    models: Record<string, TaxModel>;
  };
}

export function CostBreakdown({ ...props }: CostBreakdownProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="mt-6 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Calculation Breakdown</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{copied ? "Link copied!" : "Copy calculation link"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        <BreakdownRow 
          label="CIF Value" 
          amount={props.cifValue}
          description="(Vehicle Value × Current Rate) + Freight Charges + Insurance Charges"
        />

        {props.isPalTaxEnabled && (
          <BreakdownRow 
            label={`PAL Tax (${props.palTaxPercentage}% of CIF)`}
            amount={props.palTax}
            description="Port and Airport Levy - Calculated as percentage of CIF Value"
          />
        )}

        <BreakdownRow 
          label={`CID Tax (${props.selectedModel?.cifRate * 100}% of CIF)`}
          amount={props.cidTax}
        />

        <BreakdownRow 
          label="XID Tax"
          amount={props.xidTaxTotal}
          description={
            props.currentTaxBracket?.ratePerUnit 
              ? `Per unit rate: ${formatNumberWithCommas(props.xidTaxRate)}` 
              : `Engine Capacity (${formatNumberWithCommas(props.engineCapacity)} cc) × Rate (${formatNumberWithCommas(props.xidTaxRate)})`
          }
        />

        <BreakdownRow 
          label="Luxury Tax"
          amount={props.luxuryTax}
          description={(() => {
            const config = props.selectedModel?.luxuryTax[props.vehicleType];
            if (!config || !config.threshold) return "Not applicable for this vehicle type";
            return `For ${props.vehicleType}: If CIF > ${formatReadable(config.threshold)}, add ${config.rate * 100}% of excess amount`;
          })()}
        />

        <BreakdownRow 
          label="Subtotal (Including All Taxes Except VAT)"
          amount={props.totalWithoutVat}
          description="CIF Value + PAL Tax + CID Tax + XID Tax + Luxury Tax"
        />

        <BreakdownRow 
          label={`VAT (${props.selectedModel?.vatRate * 100}%)`}
          amount={props.vat}
        />

        <BreakdownRow 
          label="Total Import Cost"
          amount={props.totalCost}
          isTotal={true}
        />
      </div>
    </div>
  );
}


interface BreakdownRowProps {
  label: string;
  amount: number;
  description?: string;
  isTotal?: boolean;
  children?: React.ReactNode;
}

export function BreakdownRow({ label, amount, description, isTotal, children }: BreakdownRowProps) {
  return (
    <div className="py-2">
      <div className="grid grid-cols-12 gap-1 md:gap-2 items-start md:items-center">
        <div 
          className={`col-span-12 md:col-span-7 ${
            isTotal 
              ? "font-semibold text-sm md:text-base" 
              : "font-medium text-sm"
          }`}
        >
          <div className="flex items-center gap-1">
            {label}
            {description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="md:hidden">
                    <InfoIcon className="h-3 w-3 text-slate-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <div 
          className={`col-span-10 md:col-span-4 text-right ${
            isTotal 
              ? "font-semibold text-sm md:text-base" 
              : "text-sm"
          }`}
        >
          {formatCurrency(amount)}
        </div>
        <div className="col-span-2 md:col-span-1 text-right text-xs text-slate-500">
          ({formatReadable(amount)})
        </div>
      </div>
      {/* Show description only on desktop */}
      {description && (
        <div className="hidden md:block text-xs text-slate-500 mt-0.5">
          {description}
        </div>
      )}
      {children}
    </div>
  );  
}
