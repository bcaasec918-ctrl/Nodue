import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, GraduationCap, Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'class_teacher': return 'Class Teacher';
      case 'subject_teacher': return 'Subject Teacher';
      case 'student': return 'Student';
      default: return role;
    }
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-8 w-8" />
            <span className="text-xl font-bold">College Management System</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser && (
              <>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <div className="text-sm">
                    <div className="font-medium">{currentUser.name}</div>
                    <div className="text-blue-200">{getRoleDisplay(currentUser.role)}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-white hover:bg-blue-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:bg-blue-700"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && currentUser && (
        <div className="md:hidden bg-blue-500 px-4 py-3 space-y-2">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <div>
              <div className="font-medium text-white">{currentUser.name}</div>
              <div className="text-blue-200">{getRoleDisplay(currentUser.role)}</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { logout(); setMobileMenuOpen(false); }}
            className="text-white hover:bg-blue-700 w-full justify-start"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
