import VehicleImportCalculator from "@/components/vehicle-import-calculator"
import Footer from "../components/Footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-100 dark:bg-zinc-900 py-12 px-1">
      <div className="max-w-4xl mx-auto">
        <VehicleImportCalculator />

        <div className="mt-12">
          <Footer/>
        </div>
      </div>
    </main>
  )
}
