"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calculator } from "lucide-react"
import { VehicleImportForm } from "@/components/vehicle-import-form"
import { CostBreakdown } from "@/components/cost-breakdown"
import taxRatesDataImport from "@/data/tax-rates.json"
import { type TaxRatesData, type Currency, type VehicleType, type TaxRateEntry } from "@/types/tax"

const taxRatesData = taxRatesDataImport as TaxRatesData

export default function VehicleImportCalculator() {
  // Form state
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("JPY")
  const [selectedModel, setSelectedModel] = useState<keyof TaxRatesData["models"]>("default")
  const [vehicleType, setVehicleType] = useState<VehicleType>("Hybrid")
  const [engineCapacity, setEngineCapacity] = useState<number>(1500)
  const [vehicleValue, setVehicleValue] = useState<number>(0)
  const [currentRate, setCurrentRate] = useState<number>(0.5)
  const [actualRate, setActualRate] = useState<number>(0.5)
  const [freightCharges, setFreightCharges] = useState<number>(250000)
  const [insuranceCharges, setInsuranceCharges] = useState<number>(250000)
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false)
  const [palTaxPercentage, setPalTaxPercentage] = useState<number>(10)

  // Calculated values
  const [cifValue, setCifValue] = useState<number>(0)
  const [cidTax, setCidTax] = useState<number>(0)
  const [luxuryTax, setLuxuryTax] = useState<number>(0)
  const [totalWithoutVat, setTotalWithoutVat] = useState<number>(0)
  const [vat, setVat] = useState<number>(0)
  const [totalCost, setTotalCost] = useState<number>(0)
  const [xidTaxRate, setXidTaxRate] = useState<number>(0)
  const [xidTaxTotal, setXidTaxTotal] = useState<number>(0)
  const [currentTaxBracket, setCurrentTaxBracket] = useState<TaxRateEntry | null>(null)
  const [palTax, setPalTax] = useState<number>(0)

  // Get XID tax rate based on vehicle type and engine capacity
  const getXidTaxRate = (
    vehicleType: VehicleType,
    engineCapacity: number,
  ): { rate: number; bracket: TaxRateEntry | null } => {
    const selectedModelData = taxRatesData.models[selectedModel]
    if (!selectedModelData) return { rate: 0, bracket: null }

    const rates = selectedModelData.xidRates[vehicleType]
    if (!rates) return { rate: 0, bracket: null }

    const bracket = rates.find((rate: any) => engineCapacity >= rate.minCC && engineCapacity <= rate.maxCC)
    if (!bracket) return { rate: 0, bracket: null }

    // For brackets with both per unit and per CC rates, we'll use per CC by default
    // but for 1000CC below petrol and hybrid, we might want to use per unit
    if (bracket.ratePerUnit && !bracket.ratePerCC) {
      // This is for cases like hybrid 1000CC below where only per unit rate exists
      return { rate: bracket.ratePerUnit, bracket }
    } else if (bracket.ratePerCC) {
      return { rate: bracket.ratePerCC, bracket }
    }

    return { rate: 0, bracket }
  }

  // Update XID tax rate when vehicle type or engine capacity changes
  useEffect(() => {
    const { rate, bracket } = getXidTaxRate(vehicleType, engineCapacity)
    setXidTaxRate(rate)
    setCurrentTaxBracket(bracket)
  }, [vehicleType, engineCapacity, selectedModel])

  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true)
    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCurrency}`)
      const data = await response.json()

      if (data.rates && data.rates.LKR) {
        // Add 5% buffer and ceil to 2 decimal places
        const rate = data.rates.LKR
        setActualRate(rate)
        const rateWithBuffer = rate + (rate * 0.05)
        setCurrentRate(Math.ceil(rateWithBuffer * 100) / 100)
      } else {
        console.warn("Could not fetch exchange rate, using default")
      }
    } catch (error) {
      console.error("Error fetching exchange rate:", error)
    } finally {
      setIsLoadingRate(false)
    }
  }

  useEffect(() => {
    fetchExchangeRate()
  }, [selectedCurrency])

  useEffect(() => {
    // Calculate CIF Value
    const calculatedCif = vehicleValue * currentRate + freightCharges + insuranceCharges
    setCifValue(calculatedCif)

    // Calculate PAL Tax (percentage of CIF)
    const calculatedPalTax = calculatedCif * (palTaxPercentage / 100)
    setPalTax(calculatedPalTax)

    const selectedModelData = taxRatesData.models[selectedModel]
    if (!selectedModelData) return

    // Calculate CID Tax using selected model's rate
    const calculatedCidTax = calculatedCif * selectedModelData.cifRate
    setCidTax(calculatedCidTax)

    // Calculate Luxury Tax based on selected model's configuration
    let calculatedLuxuryTax = 0
    const luxuryConfig = selectedModelData.luxuryTax[vehicleType]
    if (luxuryConfig && luxuryConfig.threshold && calculatedCif > luxuryConfig.threshold) {
      calculatedLuxuryTax = (calculatedCif - luxuryConfig.threshold) * luxuryConfig.rate
    }
    setLuxuryTax(calculatedLuxuryTax)

    // Calculate XID Tax Total
    let calculatedXidTaxTotal = 0
    if (currentTaxBracket?.ratePerUnit && !currentTaxBracket?.ratePerCC) {
      // Use per unit rate (for cases like hybrid 1000CC below)
      calculatedXidTaxTotal = xidTaxRate
    } else {
      // Use per CC rate
      calculatedXidTaxTotal = engineCapacity * xidTaxRate
    }
    setXidTaxTotal(calculatedXidTaxTotal)

    // Calculate Total Without VAT
    const calculatedTotalWithoutVat = calculatedCif + calculatedPalTax + calculatedCidTax + calculatedXidTaxTotal + calculatedLuxuryTax
    setTotalWithoutVat(calculatedTotalWithoutVat)

    // Calculate VAT using selected model's rate
    const calculatedVat = calculatedTotalWithoutVat * selectedModelData.vatRate
    setVat(calculatedVat)

    // Calculate Total Cost
    setTotalCost(calculatedTotalWithoutVat + calculatedVat)
  }, [vehicleValue, currentRate, freightCharges, insuranceCharges, vehicleType, xidTaxRate, engineCapacity, currentTaxBracket, selectedModel, palTaxPercentage])

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader className="bg-slate-50 dark:bg-zinc-800  border-b rounded-t-lg">
        <div className="flex items-center gap-2">
          <CardTitle>Vehicle Import Cost Calculator</CardTitle>
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
          onCurrencyChange={setSelectedCurrency}
          onModelChange={setSelectedModel}
          onVehicleTypeChange={setVehicleType}
          onEngineCapacityChange={setEngineCapacity}
          onVehicleValueChange={setVehicleValue}
          onCurrentRateChange={setCurrentRate}
          onFreightChargesChange={setFreightCharges}
          onInsuranceChargesChange={setInsuranceCharges}
          onRefreshRate={fetchExchangeRate}
          actualRate={actualRate}
          palTax={palTax}
          palTaxPercentage={palTaxPercentage}
          onPalTaxChange={setPalTax}
          onPalTaxPercentageChange={setPalTaxPercentage}
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
        />
      </CardContent>
    </Card>
  )
}

