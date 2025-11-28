// app/components/Toast.tsx
'use client';

import { useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import Link from 'next/link';

export interface ToastProps {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick?: () => void;
        link?: string;
    };
    onClose: () => void;
}

export default function Toast({ id, type, title, message, duration = 5000, action, onClose }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const icons = {
        success: <CheckCircle className="w-6 h-6 text-green-500" />,
        error: <XCircle className="w-6 h-6 text-red-500" />,
        warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
        info: <Info className="w-6 h-6 text-blue-500" />
    };

    const bgColors = {
        success: 'bg-green-50 border-green-200',
        error: 'bg-red-50 border-red-200',
        warning: 'bg-yellow-50 border-yellow-200',
        info: 'bg-blue-50 border-blue-200'
    };

    const textColors = {
        success: 'text-green-900',
        error: 'text-red-900',
        warning: 'text-yellow-900',
        info: 'text-blue-900'
    };

    const buttonColors = {
        success: 'bg-green-600 hover:bg-green-700',
        error: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-yellow-600 hover:bg-yellow-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    };

    return (
        <div className={`max-w-md w-full ${bgColors[type]} border-2 rounded-lg shadow-lg p-4 animate-slide-in-right`}>
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {icons[type]}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className={`text-sm font-semibold ${textColors[type]} mb-1`}>
                        {title}
                    </h3>
                    <p className={`text-sm ${textColors[type]} opacity-90`}>
                        {message}
                    </p>

                    {action && (
                        <div className="mt-3">
                            {action.link ? (
                                <Link
                                    href={action.link}
                                    className={`inline-flex items-center px-3 py-1.5 ${buttonColors[type]} text-white text-sm font-medium rounded transition-colors`}
                                    onClick={onClose}
                                >
                                    {action.label}
                                </Link>
                            ) : action.onClick ? (
                                <button
                                    onClick={() => {
                                        action.onClick?.();
                                        onClose();
                                    }}
                                    className={`inline-flex items-center px-3 py-1.5 ${buttonColors[type]} text-white text-sm font-medium rounded transition-colors`}
                                >
                                    {action.label}
                                </button>
                            ) : null}
                        </div>
                    )}
                </div>

                <button
                    onClick={onClose}
                    className={`flex-shrink-0 ${textColors[type]} opacity-60 hover:opacity-100 transition-opacity`}
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
