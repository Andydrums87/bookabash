// app/browse/page.js
export const revalidate = 3600

export default function BrowsePage() {
  return (
    <div className="min-h-screen bg-[#fef7f7] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
        🎉 <span className="text-primary-500">Party</span> <span className="text-primary-300">Snap</span> Suppliers
      </h1>
      <p className="text-lg md:text-2xl text-gray-700 mb-8 max-w-2xl">
        We’re currently onboarding venues and suppliers.  
        The full directory will be launching very soon!
      </p>
      <p className="text-sm text-gray-500">
        Want to be featured?{" "}
        <a
          href="/suppliers/onboarding"
          className="text-primary-600 font-semibold hover:underline"
        >
          Apply as a supplier
        </a>
      </p>
    </div>
  )
}
