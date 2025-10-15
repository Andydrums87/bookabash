export default function PartyPhaseSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Progress Header Section */}
      <div className="w-full py-8">
        {/* Desktop - Horizontal step indicators */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between relative px-4">
            {/* Background line */}
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" style={{ left: '6.25%', right: '6.25%' }} />
            
            {/* Progress line */}
            <div className="absolute top-5 left-0 h-1 bg-gray-300" style={{ left: '6.25%', width: '50%' }} />
            
            {/* Step circles */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((step) => (
              <div key={step} className="flex flex-col items-center relative z-10" style={{ width: '12.5%' }}>
                {/* Circle */}
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  step <= 5 ? 'bg-gray-300 border-gray-300' : 'bg-white border-gray-300'
                }`}>
                  {step <= 5 && <div className="w-5 h-5 bg-gray-200 rounded"></div>}
                </div>
                {/* Label */}
                <div className="mt-2 h-3 w-12 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile - Progress bar with percentage */}
        <div className="md:hidden space-y-4 px-4">
          <div className="relative">
            {/* Percentage badge */}
            {/* <div className="absolute -top-8 left-0 right-0 flex justify-center">
              <div className="h-6 w-16 bg-gray-300 rounded-full"></div>
            </div> */}
            
            {/* Progress bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <div className="h-full w-3/5 bg-gray-300 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Progress text - both mobile and desktop */}
        <div className="mt-6 text-center space-y-2">
          <div className="h-4 w-48 bg-gray-200 rounded mx-auto"></div>
          <div className="h-5 w-56 bg-gray-200 rounded mx-auto"></div>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="space-y-4">
        {[1, 2, 3].map((stepNum) => (
          <div key={stepNum}>
            {/* Step Card */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Step Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {/* Icon circle */}
                    <div className="relative w-12 h-12 rounded-full flex items-center justify-center border-2 bg-gray-50 border-gray-200">
                      <div className="w-6 h-6 rounded bg-gray-300"></div>
                      {stepNum === 1 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-300 rounded-full"></div>
                      )}
                    </div>
                    
                    {/* Title area */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-3 w-16 rounded bg-gray-300"></div>
                        {stepNum === 1 && (
                          <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                        )}
                      </div>
                      <div className="h-5 w-40 rounded mb-1 bg-gray-200"></div>
                      <div className="h-3 w-48 rounded bg-gray-200"></div>
                    </div>
                  </div>
                  
                  {/* Chevron */}
                  <div className="w-6 h-6 rounded bg-gray-200"></div>
                </div>
              </div>

              {/* Expanded Content - only for first step */}
              {stepNum === 1 && (
                <div className="px-4 pb-4 space-y-4">
                  {/* Description */}
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-gray-100 rounded"></div>
                    <div className="h-3 w-4/5 bg-gray-100 rounded"></div>
                  </div>
                  
                  {/* Content area - could be suppliers grid or other content */}
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="space-y-3">
                      {[1, 2].map((item) => (
                        <div key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                          <div className="flex-1">
                            <div className="h-3 w-24 bg-gray-300 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-gray-200 rounded mb-1"></div>
                            <div className="h-3 w-20 bg-gray-200 rounded"></div>
                          </div>
                          <div className="h-6 w-16 bg-gray-200 rounded-full flex-shrink-0"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Connector line - except for last step */}
            {stepNum !== 3 && (
              <div className="ml-9 w-0.5 h-6 bg-gray-200"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}