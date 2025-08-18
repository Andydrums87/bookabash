import Link from 'next/link';
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ToastProvider } from '@/components/ui/toast';

export default function NotFound() {
  return (
    <ToastProvider>
      <Nav />
      <main className="flex-grow min-h-screen flex items-center justify-center bg-primary-50">
        <div className="text-center px-6 py-12 max-w-lg mx-auto">
          {/* Construction Character Image */}
          <div className="mb-8">
            <img 
              src="https://res.cloudinary.com/dghzq6xtd/image/upload/v1755509722/ChatGPT_Image_Aug_18_2025_10_35_07_AM_cm1vnl.png"
              alt="Construction dinosaur with oops sign"
              className="w-64 h-64 mx-auto object-contain drop-shadow-lg"
            />
          </div>

          {/* 404 Number with construction theme */}
          <div className="mb-6">
            <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary-400))] to-[hsl(var(--primary-500))] font-orbitron drop-shadow-sm">
              404
            </h1>
          </div>

       
          {/* Action buttons with construction theme */}
          <div className="space-y-4">
            <Link 
              href="/"
              className="inline-block w-full px-8 py-4 bg-primary-500 text-white font-bold rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-lg"
            >
              Back to Home Base
            </Link>
            
           
            
            <Link 
              href="/contact"
              className="inline-block w-full px-8 py-4 border-2 border-[hsl(var(--primary-500))] text-primary-600 font-semibold rounded-xl hover:bg-[hsl(var(--primary-100))] transition-all duration-300"
            >
              Contact Our Crew
            </Link>
          </div>

        

       
        </div>
      </main>
      <Footer />
    </ToastProvider>
  );
}