import * as React from 'react';

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 uppercase tracking-wider';

        const variants = {
            default: 'bg-gray-900 text-white hover:bg-amber-700 shadow-md hover:shadow-lg',
            outline: 'border-2 border-gray-900 bg-transparent hover:bg-gray-900 hover:text-white text-gray-900',
            ghost: 'hover:bg-gray-100 text-gray-900',
            link: 'text-gray-900 underline-offset-4 hover:underline',
        };

        const sizes = {
            default: 'h-11 px-6 py-3 text-sm',
            sm: 'h-9 px-4 text-xs',
            lg: 'h-12 px-8 text-base',
            icon: 'h-11 w-11',
        };

        const variantStyle = variants[variant] || variants.default;
        const sizeStyle = sizes[size] || sizes.default;

        return (
            <button
                className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);

Button.displayName = 'Button';

export { Button };
