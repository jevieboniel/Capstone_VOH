import React, { useEffect, useState } from 'react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  animationType = 'scale' // 'scale', 'slide-up', 'slide-down', 'fade'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
      setTimeout(() => setIsMounted(false), 300);
    }
  }, [isOpen]);

  // Animation classes based on type
  const getAnimationClasses = () => {
    const baseClasses = 'transform transition-all duration-300';
    
    switch (animationType) {
      case 'slide-up':
        return `${baseClasses} ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : 'translate-y-8 opacity-0'
        }`;
      
      case 'slide-down':
        return `${baseClasses} ${
          isVisible 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-8 opacity-0'
        }`;
      
      case 'fade':
        return `${baseClasses} ${
          isVisible 
            ? 'opacity-100' 
            : 'opacity-0'
        }`;
      
      case 'scale':
      default:
        return `${baseClasses} ${
          isVisible 
            ? 'scale-100 opacity-100' 
            : 'scale-95 opacity-0'
        }`;
    }
  };

  if (!isMounted) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay with fade animation */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      ></div>
      
      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className={`relative w-full ${sizeClasses[size]} ${getAnimationClasses()}`}
        >
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl overflow-hidden">
            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 transform hover:scale-110"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}
            
            {/* Content */}
            <div className="p-6 text-gray-900 dark:text-gray-100">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
