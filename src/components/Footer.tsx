import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              <span className="text-xl font-bold">BloodConnect</span>
            </div>
            <p className="text-gray-400">
              Smart blood donation platform connecting donors and patients through real-time matching technology.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Find Donors</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Register as Donor</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blood Banks</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Emergency Request</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How It Works</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Guidelines</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-BLOOD</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>help@bloodconnect.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>24/7 Emergency Line</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-red-600 rounded-lg">
              <div className="text-sm font-semibold">Emergency?</div>
              <div className="text-xs">Call 911 or use our instant match feature</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 BloodConnect. All rights reserved. Licensed healthcare platform.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-xs text-gray-500">HIPAA Compliant</span>
            <span className="text-xs text-gray-500">FDA Approved</span>
            <span className="text-xs text-gray-500">ISO 27001 Certified</span>
          </div>
        </div>
      </div>
    </footer>
  );
}