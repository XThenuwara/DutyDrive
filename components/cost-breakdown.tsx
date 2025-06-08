import { formatCurrency, formatReadable, formatNumberWithCommas } from "@/lib/utils";
import { type TaxModel, type VehicleType, type TaxRateEntry } from "@/types/tax";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

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
  taxRatesData: {
    models: Record<string, TaxModel>;
  };
}

export function CostBreakdown({ ...props }: CostBreakdownProps) {
  return (
    <div className="mt-6 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md border">
      <h3 className="font-semibold text-lg mb-4">Calculation Breakdown</h3>

      <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
        <BreakdownRow 
          label="CIF Value" 
          amount={props.cifValue}
          description="(Vehicle Value × Current Rate) + Freight Charges + Insurance Charges"
        />

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
          label="Total Without VAT"
          amount={props.totalWithoutVat}
          description="CIF Value + CID Tax + XID Tax + Luxury Tax"
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
