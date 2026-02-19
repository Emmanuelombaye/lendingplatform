import { Phone, Mail, MessageCircle, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../lib/api';

interface SupportContact {
  phone?: string;
  email?: string;
}

export const SupportWidget = () => {
  const [support, setSupport] = useState<SupportContact>({
    phone: '+1(870)962-0043',
    email: 'support@getvertexloans.com'
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSupportInfo = async () => {
      try {
        const res = await api.get('/public/settings');
        if (res.data.success) {
          const settings = res.data.data;
          setSupport({
            phone: settings.supportPhone || '+1(870)962-0043',
            email: settings.supportEmail || 'support@getvertexloans.com'
          });
        }
      } catch (error) {
        console.log('Using fallback support info');
      }
    };

    fetchSupportInfo();
  }, []);

  const handlePhoneCall = () => {
    window.location.href = `tel:${support.phone}`;
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent('Hello, I need help with my loan application.');
    window.open(`https://wa.me/${support.phone?.replace(/[^\d]/g, '')}?text=${message}`, '_blank');
  };

  const handleEmail = () => {
    window.location.href = `mailto:${support.email}?subject=Support Request - Vertex Loans`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Support Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 animate-pulse"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Support Panel */}
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-80 animate-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900">24/7 Support</h3>
              <p className="text-sm text-slate-600">We're here to help</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ×
            </button>
          </div>

          {/* Contact Options */}
          <div className="space-y-3">
            {/* Phone Call */}
            <button
              onClick={handlePhoneCall}
              className="w-full flex items-center gap-4 p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Phone size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Call Us</div>
                <div className="text-sm text-slate-600">{support.phone}</div>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              onClick={handleWhatsApp}
              className="w-full flex items-center gap-4 p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <MessageCircle size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">WhatsApp</div>
                <div className="text-sm text-slate-600">Chat instantly</div>
              </div>
            </button>

            {/* Email */}
            <button
              onClick={handleEmail}
              className="w-full flex items-center gap-4 p-4 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
            >
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Mail size={18} />
              </div>
              <div className="text-left">
                <div className="font-bold text-slate-900">Email Support</div>
                <div className="text-sm text-slate-600">{support.email}</div>
              </div>
            </button>
          </div>

          {/* Support Hours */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-2 text-slate-600 mb-2">
              <Clock size={16} />
              <span className="text-sm font-medium">Support Hours</span>
            </div>
            <div className="text-xs text-slate-600">
              <div>Monday - Friday: 8:00 AM - 8:00 PM</div>
              <div>Saturday: 9:00 AM - 5:00 PM</div>
              <div>Sunday: 10:00 AM - 4:00 PM</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
