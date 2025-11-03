"use client"

import { useState } from 'react'
import { PoundSterling, TrendingUp, TrendingDown, Edit2, Check, X, AlertTriangle } from 'lucide-react'

export default function BudgetOverview({ suppliers = {}, enquiries = [], partyDetails }) {
  const [budget, setBudget] = useState(partyDetails?.budget || null)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [tempBudget, setTempBudget] = useState('')

  // Calculate spending by category
  const calculateSpending = () => {
    const categories = {}
    let totalSpent = 0

    // Process each enquiry to get actual costs
    enquiries.forEach(enquiry => {
      const category = enquiry.supplier_category
      const cost = parseFloat(enquiry.supplier_price || enquiry.price || 0)

      if (cost > 0) {
        if (!categories[category]) {
          categories[category] = {
            name: getCategoryName(category),
            spent: 0,
            suppliers: []
          }
        }

        categories[category].spent += cost
        categories[category].suppliers.push({
          name: enquiry.supplier_name,
          cost: cost
        })

        totalSpent += cost
      }
    })

    return { categories, totalSpent }
  }

  const getCategoryName = (category) => {
    const names = {
      venue: 'Venue',
      entertainment: 'Entertainment',
      catering: 'Catering',
      cakes: 'Cake',
      decorations: 'Decorations',
      partyBags: 'Party Bags',
      photographer: 'Photography'
    }
    return names[category] || category
  }

  const getCategoryColor = (category) => {
    const colors = {
      venue: 'bg-blue-500',
      entertainment: 'bg-purple-500',
      catering: 'bg-orange-500',
      cakes: 'bg-pink-500',
      decorations: 'bg-green-500',
      partyBags: 'bg-yellow-500',
      photographer: 'bg-indigo-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  const { categories, totalSpent } = calculateSpending()
  const remaining = budget ? budget - totalSpent : null
  const percentageSpent = budget ? (totalSpent / budget) * 100 : 0
  const isOverBudget = budget && totalSpent > budget

  const saveBudget = () => {
    const newBudget = parseFloat(tempBudget)
    if (!isNaN(newBudget) && newBudget > 0) {
      setBudget(newBudget)
      // TODO: Save to database
    }
    setIsEditingBudget(false)
    setTempBudget('')
  }

  const cancelEdit = () => {
    setIsEditingBudget(false)
    setTempBudget('')
  }

  if (totalSpent === 0 && !budget) {
    return (
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
        <p className="text-sm text-gray-500 mb-4">Set a budget to track your party spending</p>
        <button
          onClick={() => setIsEditingBudget(true)}
          className="w-full bg-primary-600 text-white rounded-lg py-2 px-4 text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          Set Budget
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-end mb-6">
        {!isEditingBudget ? (
          <button
            onClick={() => {
              setIsEditingBudget(true)
              setTempBudget(budget || '')
            }}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <Edit2 className="w-4 h-4" />
            {budget ? 'Edit' : 'Set Budget'}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={saveBudget}
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {isEditingBudget && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Set your total party budget
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">£</span>
            <input
              type="number"
              value={tempBudget}
              onChange={(e) => setTempBudget(e.target.value)}
              placeholder="500"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              autoFocus
            />
          </div>
        </div>
      )}

      {/* Budget Summary */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-500 mb-1">Total Spent</p>
          <p className="text-2xl font-bold text-gray-900">£{totalSpent.toFixed(2)}</p>
        </div>
        {budget && (
          <div>
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
              £{Math.abs(remaining).toFixed(2)}
              {isOverBudget && ' over'}
            </p>
          </div>
        )}
      </div>

      {/* Budget Progress Bar */}
      {budget && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              {percentageSpent.toFixed(0)}% of £{budget.toFixed(2)}
            </span>
            {isOverBudget ? (
              <div className="flex items-center gap-1 text-red-600">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Over budget</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-green-600">
                <TrendingDown className="w-4 h-4" />
                <span className="text-sm font-medium">On track</span>
              </div>
            )}
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(percentageSpent, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      {Object.keys(categories).length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Spending by Category</h4>
          <div className="space-y-3">
            {Object.entries(categories).map(([key, category]) => {
              const percentage = budget ? (category.spent / budget) * 100 : 0

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm font-semibold text-gray-900">£{category.spent.toFixed(2)}</span>
                  </div>

                  {budget && (
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getCategoryColor(key)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  )}

                  {/* Show supplier details */}
                  {category.suppliers.length > 0 && (
                    <div className="mt-1 ml-2">
                      {category.suppliers.map((supplier, idx) => (
                        <p key={idx} className="text-xs text-gray-500">
                          {supplier.name}: £{supplier.cost.toFixed(2)}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Warning if over budget */}
      {isOverBudget && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Over Budget</p>
              <p className="text-sm text-red-800">
                You're £{Math.abs(remaining).toFixed(2)} over your budget. Consider reviewing your selections.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
