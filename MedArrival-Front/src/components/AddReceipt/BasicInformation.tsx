// BasicInformation.tsx
import React from 'react';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { ReceiptForm } from '@/types/receipt';
import { useTranslation } from 'react-i18next';
import { ClipboardList, Hash, CalendarDays, CreditCard, Building, FileText, Banknote, Truck, ListChecks } from 'lucide-react';

interface BasicInformationProps {
    register: UseFormRegister<ReceiptForm>;
    errors: FieldErrors<ReceiptForm>;
}

export const BasicInformation: React.FC<BasicInformationProps> = ({
    register,
    errors
}) => {
    const { t } = useTranslation('receipts');

    const renderField = (
        name: keyof ReceiptForm,
        icon: React.ReactNode,
        required?: boolean,
        type: string = 'text',
        component: 'input' | 'textarea' = 'input'
    ) => {
        const label = t(`receipts.addReceipt.basicInfo.fields.${name}.label`);
        const placeholder = t(`receipts.addReceipt.basicInfo.fields.${name}.placeholder`);
        const error = errors[name];

        return (
            <div className="space-y-1.5 text-gray-900 dark:text-white">
                <Label>
                    <div className="flex items-center gap-2">
                        {icon}
                        {label}
                        {required && <span className="text-destructive ml-1">*</span>}
                    </div>
                </Label>
                {component === 'input' ? (
                    <Input
                        id={name}
                        type={type}
                        {...register(name, { required })}
                        placeholder={placeholder}
                        className={`${error ? 'border-destructive' : ''} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                ) : (
                    <Textarea
                        id={name}
                        {...register(name)}
                        placeholder={placeholder}
                        className={`${error ? 'border-destructive' : ''} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100`}
                    />
                )}
                {error && (
                    <p className="text-sm text-destructive">
                        {t('common.messages.errors.required')}
                    </p>
                )}
            </div>
        );
    };

    return (
        <Card className="border-border">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                        {t('receipts.addReceipt.basicInfo.title')}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('receiptNumber', <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />, true)}
                    {renderField('receiptDate', <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />, true, 'date')}
                    {renderField('referenceNumber', <FileText className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    {renderField('tvaPercentage', <CreditCard className="h-4 w-4 text-gray-500 dark:text-gray-400" />, false, 'number')}
                    {renderField('paymentTerms', <CalendarDays className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    {renderField('issuingDepartment', <Building className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    {renderField('iceNumber', <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    {renderField('bankAccount', <Banknote className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    <div className="md:col-span-2">
                        {renderField('bankDetails', <Banknote className="h-4 w-4 text-gray-500 dark:text-gray-400" />, false, 'text', 'textarea')}
                    </div>
                    {renderField('deliveryRef', <Truck className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                    {renderField('deliveryNoteNumbers', <ListChecks className="h-4 w-4 text-gray-500 dark:text-gray-400" />)}
                </div>
            </CardContent>
        </Card>
    );
};

export default BasicInformation;