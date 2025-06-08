import VehicleImportCalculator from "@/components/vehicle-import-calculator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-1">
      <div className="max-w-4xl mx-auto">
        <VehicleImportCalculator />
      </div>
    </main>
  )
}
