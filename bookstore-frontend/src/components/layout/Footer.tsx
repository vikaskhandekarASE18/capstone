import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-7 w-7 text-blue-400" />
              <span className="font-bold text-xl text-white">BookStore</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your go-to destination for books of every genre. Discover, read, and grow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalogue" className="hover:text-white transition">All Books</Link></li>
              <li><Link to="/catalogue?category=fiction" className="hover:text-white transition">Fiction</Link></li>
              <li><Link to="/catalogue?category=science-tech" className="hover:text-white transition">Science & Tech</Link></li>
              <li><Link to="/catalogue?category=self-help" className="hover:text-white transition">Self Help</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="hover:text-white transition">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-white transition">Register</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">My Orders</Link></li>
              <li><Link to="/gift-points" className="hover:text-white transition">Gift Points</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                <span>support@bookstore.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400 shrink-0" />
                <span>+91 1800-000-0000</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <span>123 Book Lane, Pune, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} BookStore. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
