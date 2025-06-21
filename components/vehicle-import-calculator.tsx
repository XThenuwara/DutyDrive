"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VehicleImportForm } from "@/components/vehicle-import-form";
import { CostBreakdown } from "@/components/cost-breakdown";
import taxRatesDataImport from "@/data/tax-rates.json";
import { type TaxRatesData, type Currency, type VehicleType, type TaxRateEntry } from "@/types/tax";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

const taxRatesData = taxRatesDataImport as TaxRatesData;

function VehicleImportCalculatorContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper function to update URL parameters
  const updateUrlParams = (updates: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Form state with URL parameter initialization
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>((searchParams.get("currency") as Currency) || "JPY");
  const [selectedModel, setSelectedModel] = useState<keyof TaxRatesData["models"]>((searchParams.get("model") as keyof TaxRatesData["models"]) || "default");
  const [vehicleType, setVehicleType] = useState<VehicleType>((searchParams.get("type") as VehicleType) || "Hybrid");
  const [engineCapacity, setEngineCapacity] = useState<number>(Number(searchParams.get("cc")) || 1500);
  const [vehicleValue, setVehicleValue] = useState<number>(Number(searchParams.get("value")) || 0);
  const [currentRate, setCurrentRate] = useState<number>(() => {
    const rateFromUrl = searchParams.get("rate");
    return rateFromUrl ? Number(rateFromUrl) : 0.5;
  });
  const [actualRate, setActualRate] = useState<number>(() => {
    const rateFromUrl = searchParams.get("rate");
    return rateFromUrl ? Number(rateFromUrl) : 0.5;
  });
  const [freightCharges, setFreightCharges] = useState<number>(Number(searchParams.get("freight")) || 250000);
  const [insuranceCharges, setInsuranceCharges] = useState<number>(Number(searchParams.get("insurance")) || 250000);
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [palTaxPercentage, setPalTaxPercentage] = useState<number>(Number(searchParams.get("palPercentage")) || 10);
  const [isPalTaxEnabled, setIsPalTaxEnabled] = useState<boolean>(searchParams.get("palEnabled") !== "false");
  const [isXidRateManual, setIsXidRateManual] = useState<boolean>(searchParams.get("xidManual") === "true");

  // Wrapped state setters to update URL parameters
  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    updateUrlParams({ currency });
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model as keyof TaxRatesData["models"]);
    updateUrlParams({ model });
  };

  const handleVehicleTypeChange = (type: VehicleType) => {
    setVehicleType(type);
    updateUrlParams({ type });
  };

  const handleEngineCapacityChange = (capacity: number) => {
    setEngineCapacity(capacity);
    updateUrlParams({ cc: capacity });
  };

  const handleVehicleValueChange = (value: number) => {
    setVehicleValue(value);
    updateUrlParams({ value });
  };

  const handleCurrentRateChange = (rate: number) => {
    setCurrentRate(rate);
    updateUrlParams({ rate });
  };

  const handleFreightChargesChange = (charges: number) => {
    setFreightCharges(charges);
    updateUrlParams({ freight: charges });
  };

  const handleInsuranceChargesChange = (charges: number) => {
    setInsuranceCharges(charges);
    updateUrlParams({ insurance: charges });
  };

  const handlePalTaxPercentageChange = (percentage: number) => {
    setPalTaxPercentage(percentage);
    updateUrlParams({ palPercentage: percentage });
  };

  const handlePalTaxEnabledChange = (enabled: boolean) => {
    setIsPalTaxEnabled(enabled);
    updateUrlParams({ palEnabled: enabled });
  };

  const handleXidTaxRateChange = (rate: number) => {
    setXidTaxRate(rate);
    setIsXidRateManual(true);
    updateUrlParams({ xidRate: rate, xidManual: true });
  };

  const handleResetXidRate = () => {
    setIsXidRateManual(false);
    updateUrlParams({ xidManual: false });
    const { rate, bracket } = getXidTaxRate(vehicleType, engineCapacity);
    setXidTaxRate(rate);
    setCurrentTaxBracket(bracket);
  };

  // Calculated values
  const [cifValue, setCifValue] = useState<number>(0);
  const [cidTax, setCidTax] = useState<number>(0);
  const [luxuryTax, setLuxuryTax] = useState<number>(0);
  const [totalWithoutVat, setTotalWithoutVat] = useState<number>(0);
  const [vat, setVat] = useState<number>(0);
  const [totalCost, setTotalCost] = useState<number>(0);
  const [xidTaxRate, setXidTaxRate] = useState<number>(0);
  const [xidTaxTotal, setXidTaxTotal] = useState<number>(0);
  const [currentTaxBracket, setCurrentTaxBracket] = useState<TaxRateEntry | null>(null);
  const [palTax, setPalTax] = useState<number>(0);

  // Get XID tax rate based on vehicle type and engine capacity
  const getXidTaxRate = (vehicleType: VehicleType, engineCapacity: number): { rate: number; bracket: TaxRateEntry | null } => {
    const selectedModelData = taxRatesData.models[selectedModel];
    if (!selectedModelData) return { rate: 0, bracket: null };

    const rates = selectedModelData.xidRates[vehicleType];
    if (!rates) return { rate: 0, bracket: null };

    const bracket = rates.find((rate: any) => engineCapacity >= rate.minCC && engineCapacity <= rate.maxCC);
    if (!bracket) return { rate: 0, bracket: null };

    // For brackets with both per unit and per CC rates, we'll use per CC by default
    // but for 1000CC below petrol and hybrid, we might want to use per unit
    if (bracket.ratePerUnit && !bracket.ratePerCC) {
      // This is for cases like hybrid 1000CC below where only per unit rate exists
      return { rate: bracket.ratePerUnit, bracket };
    } else if (bracket.ratePerCC) {
      return { rate: bracket.ratePerCC, bracket };
    }

    return { rate: 0, bracket };
  };

  // Update XID tax rate when vehicle type or engine capacity changes
  useEffect(() => {
    if (!isXidRateManual) {
      const { rate, bracket } = getXidTaxRate(vehicleType, engineCapacity);
      setXidTaxRate(rate);
      setCurrentTaxBracket(bracket);
    }
  }, [vehicleType, engineCapacity, selectedModel, isXidRateManual]);

  // Fetch exchange rate from API
  const fetchExchangeRate = async (forced? : boolean) => {
    // Skip if we have a rate from URL
    if (searchParams.has("rate") && !forced) {
      return;
    }

    setIsLoadingRate(true);
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCurrency}`);
      const data = await response.json();

      if (data.rates && data.rates.LKR) {
        // Add 5% buffer and ceil to 2 decimal places
        const rate = data.rates.LKR;
        setActualRate(rate);
        const rateWithBuffer = rate + rate * 0.05;
        setCurrentRate(Math.ceil(rateWithBuffer * 100) / 100);
      } else {
        console.warn("Could not fetch exchange rate, using default");
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Only fetch rate on initial load if no rate in URL
  useEffect(() => {
    if (!searchParams.has("rate")) {
      fetchExchangeRate();
    }
  }, [selectedCurrency]);

  useEffect(() => {
    // Calculate CIF Value
    const calculatedCif = vehicleValue * currentRate + freightCharges + insuranceCharges;
    setCifValue(calculatedCif);

    // Calculate PAL Tax (percentage of CIF) if enabled
    const calculatedPalTax = isPalTaxEnabled ? calculatedCif * (palTaxPercentage / 100) : 0;
    setPalTax(calculatedPalTax);

    const selectedModelData = taxRatesData.models[selectedModel];
    if (!selectedModelData) return;

    // Calculate CID Tax using selected model's rate
    const calculatedCidTax = calculatedCif * selectedModelData.cifRate;
    setCidTax(calculatedCidTax);

    // Calculate Luxury Tax based on selected model's configuration
    let calculatedLuxuryTax = 0;
    const luxuryConfig = selectedModelData.luxuryTax[vehicleType];
    if (luxuryConfig && luxuryConfig.threshold && calculatedCif > luxuryConfig.threshold) {
      calculatedLuxuryTax = (calculatedCif - luxuryConfig.threshold) * luxuryConfig.rate;
    }
    setLuxuryTax(calculatedLuxuryTax);

    // Calculate XID Tax Total
    let calculatedXidTaxTotal = 0;
    if (currentTaxBracket?.ratePerUnit && !currentTaxBracket?.ratePerCC) {
      // Use per unit rate (for cases like hybrid 1000CC below)
      calculatedXidTaxTotal = xidTaxRate;
    } else {
      // Use per CC rate
      calculatedXidTaxTotal = engineCapacity * xidTaxRate;
    }
    setXidTaxTotal(calculatedXidTaxTotal);

    // Calculate Total Without VAT
    const calculatedTotalWithoutVat = calculatedCif + calculatedPalTax + calculatedCidTax + calculatedXidTaxTotal + calculatedLuxuryTax;
    setTotalWithoutVat(calculatedTotalWithoutVat);

    // Calculate VAT using selected model's rate
    const calculatedVat = calculatedTotalWithoutVat * selectedModelData.vatRate;
    setVat(calculatedVat);

    // Calculate Total Cost
    setTotalCost(calculatedTotalWithoutVat + calculatedVat);
  }, [vehicleValue, currentRate, freightCharges, insuranceCharges, vehicleType, xidTaxRate, engineCapacity, currentTaxBracket, selectedModel, palTaxPercentage, isPalTaxEnabled]);

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader className="bg-slate-50 dark:bg-zinc-800  border-b rounded-t-lg">
        <div className="flex items-center gap-2">
          <CardTitle>Sri Lanka Vehicle Import Cost Calculator</CardTitle>
        </div>
        <CardDescription>Enter your vehicle details to calculate import costs</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 px-2 p-2 md:px-4 dark:bg-zinc-800">
        <VehicleImportForm
          selectedCurrency={selectedCurrency}
          selectedModel={selectedModel}
          vehicleType={vehicleType}
          engineCapacity={engineCapacity}
          vehicleValue={vehicleValue}
          currentRate={currentRate}
          freightCharges={freightCharges}
          insuranceCharges={insuranceCharges}
          isLoadingRate={isLoadingRate}
          currentTaxBracket={currentTaxBracket}
          xidTaxRate={xidTaxRate}
          xidTaxTotal={xidTaxTotal}
          taxRatesData={taxRatesData}
          onCurrencyChange={handleCurrencyChange}
          onModelChange={handleModelChange}
          onVehicleTypeChange={handleVehicleTypeChange}
          onEngineCapacityChange={handleEngineCapacityChange}
          onVehicleValueChange={handleVehicleValueChange}
          onCurrentRateChange={handleCurrentRateChange}
          onFreightChargesChange={handleFreightChargesChange}
          onInsuranceChargesChange={handleInsuranceChargesChange}
          onXidTaxRateChange={handleXidTaxRateChange}
          onResetXidRate={handleResetXidRate}
          actualRate={actualRate}
          palTax={palTax}
          palTaxPercentage={palTaxPercentage}
          onPalTaxChange={setPalTax}
          onPalTaxPercentageChange={handlePalTaxPercentageChange}
          isPalTaxEnabled={isPalTaxEnabled}
          onPalTaxEnabledChange={handlePalTaxEnabledChange}
          isXidRateManual={isXidRateManual}
          onRefreshRate={()=>fetchExchangeRate(true)}
        />

        <CostBreakdown
          cifValue={cifValue}
          cidTax={cidTax}
          xidTaxTotal={xidTaxTotal}
          luxuryTax={luxuryTax}
          totalWithoutVat={totalWithoutVat}
          vat={vat}
          totalCost={totalCost}
          selectedModel={taxRatesData.models[selectedModel]}
          vehicleType={vehicleType}
          engineCapacity={engineCapacity}
          xidTaxRate={xidTaxRate}
          currentTaxBracket={currentTaxBracket}
          taxRatesData={taxRatesData}
          palTax={palTax}
          palTaxPercentage={palTaxPercentage}
          isPalTaxEnabled={isPalTaxEnabled}
        />
      </CardContent>
    </Card>
  );
}

export default function VehicleImportCalculator() {
  return (
    <Suspense
      fallback={
        <Card className="shadow-lg rounded-lg">
          <CardHeader className="bg-slate-50 dark:bg-zinc-800 border-b rounded-t-lg">
            <div className="flex items-center gap-2">
              <CardTitle>Sri Lanka Vehicle Import Cost Calculator</CardTitle>
            </div>
            <CardDescription>Loading calculator...</CardDescription>
          </CardHeader>
        </Card>
      }>
      <VehicleImportCalculatorContent />
    </Suspense>
  );
}
