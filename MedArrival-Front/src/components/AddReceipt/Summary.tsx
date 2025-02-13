import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SummaryProps {
    totalHT: number;
    totalTTC: number;
}

export const Summary: React.FC<SummaryProps> = ({ totalHT, totalTTC }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total HT</span>
                        <span className="text-lg font-medium">{totalHT.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total TTC</span>
                        <span className="text-lg font-medium">{totalTTC.toFixed(2)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};