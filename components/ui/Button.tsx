import Link from 'next/link';
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  href?: string;
  /** Só aplicado quando `href` está definido (ex.: links externos). */
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  disabled?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  className = '',
  type = 'button',
  href,
  target,
  rel,
  disabled = false,
}: ButtonProps) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center';

  const variants = {
    primary: 'bg-[#2563EB] hover:bg-blue-700 text-white shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg',
    outline: 'border-2 border-[#2563EB] text-[#2563EB] hover:bg-blue-50',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const disabledClass = disabled ? ' opacity-60 pointer-events-none cursor-not-allowed' : '';
  const mergedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]}${disabledClass} ${className}`;

  if (href) {
    return (
      <Link
        href={href}
        className={mergedClassName}
        onClick={onClick}
        aria-disabled={disabled}
        target={target}
        rel={rel}
      >
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={mergedClassName} disabled={disabled}>
      {children}
    </button>
  );
}
