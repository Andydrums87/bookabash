// components/Breadcrumb.js

import { ChevronLeft, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

const Breadcrumb = ({ hasUnsavedChanges }) => {
  const router = useRouter()

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </button>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">E-Invites</span>
          {hasUnsavedChanges && (
            <div className="flex items-center ml-4 text-orange-600">
              <AlertCircle className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">Unsaved changes</span>
            </div>
          )}
        </nav>
      </div>
    </div>
  )
}

export default Breadcrumb