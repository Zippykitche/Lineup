import { ArrowRight, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import logo from '../../assets/KBC-PODCASTS-LOGO-1.png';

export function EmailTemplatePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3f3f5] p-4 font-sans text-[#10123d] relative">
      <button 
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 flex items-center gap-2 text-sm text-[#2e3192] hover:text-[#1f2168] bg-white px-4 py-2 rounded-lg shadow-sm border border-blue-100 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Login
      </button>

      <div className="max-w-xl w-full pt-12 sm:pt-0">
        {/* Helper Note for the preview */}
        <div className="mb-6 bg-white/80 p-4 rounded-xl border border-blue-200 shadow-sm flex items-start gap-3 backdrop-blur-sm">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Email Template Mockup:</strong> This page demonstrates how the password reset email will look when sent to staff members via Firebase Authentication. 
          </p>
        </div>

        {/* Email Container Mockup */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#f0f1fa] px-8 py-6 text-center border-b border-[#cbceea]">
            <img 
              src={logo} 
              alt="KBC Logo" 
              className="h-14 w-auto mx-auto object-contain" 
            />
          </div>

          {/* Body */}
          <div className="px-8 py-10">
            <h1 className="text-2xl font-bold text-[#10123d] mb-6">
              Reset your Lineup password
            </h1>
            
            <div className="space-y-4 text-[16px] text-gray-700 leading-relaxed mb-8">
              <p>Hello,</p>
              <p>
                We received a request to reset the password associated with your KBC Lineup account. 
                Click the button below to choose a new password.
              </p>
            </div>

            {/* Action Button */}
            <div className="mb-8">
              <a 
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center justify-center bg-[#2e3192] hover:bg-[#1f2168] text-white font-medium px-6 py-3 rounded-lg shadow-md transition-colors w-full sm:w-auto"
              >
                Reset Password
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </div>

            <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
              <p>
                If you did not request a password reset, you can safely ignore this email. 
                Your account remains secure and your current password will not be changed.
              </p>
              <p>
                This link will expire in 1 hour for security purposes.
              </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-gray-700 font-medium mb-1">
                KBC IT Support
              </p>
              <p className="text-sm text-gray-500">
                Automated Service Desk
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-[#10123d] px-8 py-6 text-center">
            <p className="text-[#a8addb] text-xs leading-relaxed mb-2">
              This is an automated message from the KBC Lineup Editorial System. Please do not reply to this email.
            </p>
            <p className="text-[#626ab4] text-xs">
              © 2026 KBC. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
