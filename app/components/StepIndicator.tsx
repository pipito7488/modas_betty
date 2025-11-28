// app/components/StepIndicator.tsx
'use client';

import { Check } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    steps: {
        number: number;
        title: string;
    }[];
}

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="w-full max-w-3xl mx-auto mb-8">
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = step.number < currentStep;
                    const isCurrent = step.number === currentStep;
                    const isUpcoming = step.number > currentStep;

                    return (
                        <div key={step.number} className="flex items-center flex-1">
                            {/* Step Circle */}
                            <div className="flex flex-col items-center flex-shrink-0">
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${isCompleted
                                            ? 'bg-green-600 text-white'
                                            : isCurrent
                                                ? 'bg-amber-700 text-white ring-4 ring-amber-200'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </div>
                                <p
                                    className={`mt-2 text-sm font-medium ${isCurrent
                                            ? 'text-amber-700'
                                            : isCompleted
                                                ? 'text-green-600'
                                                : 'text-gray-500'
                                        }`}
                                >
                                    {step.title}
                                </p>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-1 mx-4 -mt-6">
                                    <div
                                        className={`h-full transition-all ${step.number < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                            }`}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
