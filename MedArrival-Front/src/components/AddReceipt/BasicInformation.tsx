import React from 'react';
import * as Label from '@radix-ui/react-label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ReceiptForm } from '@/types/receipt';

interface BasicInformationProps {
    register: UseFormRegister<ReceiptForm>;
    errors: FieldErrors<ReceiptForm>;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
    register,
    errors
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Receipt Number *
                        </Label.Root>
                        <Input
                            {...register('receiptNumber', { required: true })}
                            placeholder="Enter receipt number"
                            error={errors.receiptNumber}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Receipt Date *
                        </Label.Root>
                        <Input
                            type="date"
                            {...register('receiptDate', { required: true })}
                            error={errors.receiptDate}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Reference Number
                        </Label.Root>
                        <Input
                            {...register('referenceNumber')}
                            placeholder="Enter reference number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            TVA Percentage
                        </Label.Root>
                        <Input
                            type="number"
                            step="0.01"
                            {...register('tvaPercentage')}
                            placeholder="Enter TVA percentage"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Terms
                        </Label.Root>
                        <Input
                            {...register('paymentTerms')}
                            placeholder="Enter payment terms"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Issuing Department
                        </Label.Root>
                        <Input
                            {...register('issuingDepartment')}
                            placeholder="Enter issuing department"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            ICE Number
                        </Label.Root>
                        <Input
                            {...register('iceNumber')}
                            placeholder="Enter ICE number"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bank Account
                        </Label.Root>
                        <Input
                            {...register('bankAccount')}
                            placeholder="Enter bank account"
                        />
                    </div>

                    <div className="col-span-2 space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Bank Details
                        </Label.Root>
                        <Textarea
                            {...register('bankDetails')}
                            placeholder="Enter bank details"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Delivery Reference
                        </Label.Root>
                        <Input
                            {...register('deliveryRef')}
                            placeholder="Enter delivery reference"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Delivery Note Numbers
                        </Label.Root>
                        <Input
                            {...register('deliveryNoteNumbers')}
                            placeholder="Enter delivery note numbers"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};