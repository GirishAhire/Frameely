import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-200 w-full mt-auto border-t">
      <div className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">About Frameely</h3>
          <p className="text-sm text-gray-400">
            Frameely is your one-stop shop for custom photo frames. We blend quality craftsmanship with modern design to help you showcase your memories beautifully.
          </p>
        </div>
        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/catalog" className="hover:text-blue-400 transition-colors">Catalog</a></li>
            <li><a href="/upload-preview" className="hover:text-blue-400 transition-colors">Upload</a></li>
            <li><a href="/checkout" className="hover:text-blue-400 transition-colors">Checkout</a></li>
            <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
          </ul>
        </div>
        {/* Contact */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">Contact</h3>
          <ul className="text-sm space-y-2">
            <li>Email: <a href="mailto:support@frameely.com" className="hover:text-blue-400">support@frameely.com</a></li>
            <li>Phone: <a href="tel:+1234567890" className="hover:text-blue-400">+1 234 567 890</a></li>
            <li>Address: 123 Frame St, Art City, Country</li>
          </ul>
        </div>
        {/* Socials */}
        <div>
          <h3 className="text-lg font-bold mb-3 text-white">Follow Us</h3>
          <div className="flex space-x-4 mt-2">
            <a href="#" className="hover:text-blue-400" aria-label="Instagram"><i className="fab fa-instagram"></i> Instagram</a>
            <a href="#" className="hover:text-blue-400" aria-label="Facebook"><i className="fab fa-facebook"></i> Facebook</a>
            <a href="#" className="hover:text-blue-400" aria-label="Twitter"><i className="fab fa-twitter"></i> Twitter</a>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-gray-500 text-xs">
        © {new Date().getFullYear()} Frameely. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 