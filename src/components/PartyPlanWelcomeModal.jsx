"use client"

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Building } from 'lucide-react';
import Image from 'next/image';

export default function PartyPlanWelcomeModal({ isOpen, onClose, childrenCount = 10 }) {
  const coreComponents = [
    {
      name: 'Venue',
      icon: null, // Use Building icon from lucide
    },
    {
      name: 'Entertainment',
      icon: '/category-icons/entertainment.png',
    },
    {
      name: 'Cake',
      icon: '/category-icons/cake.png',
    },
    {
      name: 'Party Bags',
      icon: '/category-icons/party-bags.png',
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <div className="text-center space-y-6 py-2">
          {/* Header */}
          <div>
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Party Plan is Ready!
            </h2>
            <p className="text-gray-700">
              We've built a starter pack for <span className="font-bold text-[hsl(var(--primary-600))]">{childrenCount} children</span>
            </p>
          </div>

          {/* Core Components */}
          <div>
            <p className="text-sm text-gray-600 mb-3">Here's what we've included:</p>
            <div className="flex justify-center gap-3">
              {coreComponents.map((component, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div className="w-14 h-14 flex items-center justify-center bg-primary-50 rounded-lg border border-primary-200">
                    {component.icon ? (
                      <Image
                        src={component.icon}
                        alt={component.name}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    ) : (
                      <Building className="w-8 h-8 text-primary-600" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{component.name}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Simple message */}
          <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
            <p className="text-sm text-gray-700">
              You can <span className="font-semibold">swap</span>, <span className="font-semibold">add</span>, <span className="font-semibold">customize</span>, or <span className="font-semibold">remove</span> any suppliers to make it perfect for your party!
            </p>
          </div>

          <Button
            onClick={onClose}
            className="w-full h-11 bg-gradient-to-r from-[hsl(var(--primary-500))] to-[hsl(var(--primary-600))] hover:from-[hsl(var(--primary-600))] hover:to-[hsl(var(--primary-700))] text-white font-bold shadow-lg"
          >
            Let's Go! 🚀
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
