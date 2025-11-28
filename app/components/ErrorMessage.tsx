// app/components/ErrorMessage.tsx
'use client';

import Link from 'next/link';
import { AlertTriangle, ExternalLink, Lightbulb } from 'lucide-react';

interface ErrorMessageProps {
    title: string;
    message: string;
    tip?: string;
    action?: {
        label: string;
        link: string;
    };
}

export default function ErrorMessage({ title, message, tip, action }: ErrorMessageProps) {
    return (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 animate-fade-in">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-red-800 mb-4">
                        {message}
                    </p>

                    {tip && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                            <div className="flex items-start gap-2">
                                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-900">
                                    {tip}
                                </p>
                            </div>
                        </div>
                    )}

                    {action && (
                        <Link
                            href={action.link}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {action.label}
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
