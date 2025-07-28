// Add this component at the bottom of your dashboard file (before the final closing brace)
// or create it as a separate file and import it

function PostPaymentSuccessSection({ suppliers, enquiries, partyDetails, paymentDetails }) {
    // Get confirmed suppliers with contact details from enquiries
    const confirmedSuppliers = Object.entries(suppliers)
      .filter(([key, supplier]) => supplier && key !== 'einvites')
      .map(([type, supplier]) => {
        const enquiry = enquiries.find(e => e.supplier_category === type)
        return {
          type,
          name: supplier.name,
          category: type.charAt(0).toUpperCase() + type.slice(1),
          phone: enquiry?.supplier_phone || supplier.phone || 'Contact via email',
          email: enquiry?.supplier_email || supplier.email || 'Available in booking confirmation',
          status: enquiry?.status || 'confirmed',
          image: supplier.image
        }
      })
      .filter(supplier => supplier.status === 'accepted')
  
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              🎉 Booking Confirmed!
            </h2>
            <p className="text-gray-600">
              Your party deposit has been paid and all suppliers have your contact details
            </p>
          </div>
  
          {/* Next Steps */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your suppliers will contact you within 24 hours</li>
              <li>• Discuss final details and arrangements directly</li>
              <li>• Remaining balance due on party day: £{paymentDetails?.remainingBalance || 0}</li>
              <li>• Enjoy your magical party! ✨</li>
            </ul>
          </div>
  
          {/* Quick Contact Cards */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Contact Your Party Team:</h3>
            {confirmedSuppliers.length > 0 ? (
              confirmedSuppliers.map((supplier) => (
                <div key={supplier.type} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-primary-700">
                        {supplier.category.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{supplier.name}</h4>
                      <p className="text-xs text-gray-600">{supplier.category}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {supplier.phone !== 'Contact via email' && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`tel:${supplier.phone}`}>Call</a>
                      </Button>
                    )}
                    <Button size="sm" asChild>
                      <a href={`mailto:${supplier.email}`}>Email</a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">Contact details will be available once suppliers accept your booking.</p>
            )}
          </div>
  
          {/* Payment Summary */}
          {paymentDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Deposit paid:</span>
                <span className="font-bold text-green-600">£{paymentDetails.depositAmount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Remaining balance:</span>
                <span className="font-bold text-gray-900">£{paymentDetails.remainingBalance}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }