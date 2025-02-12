// src/pages/Receipts/AddReceiptPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import {
    FileText,
    Plus,
    Trash2,
    ArrowLeft,
    Upload,
    X,
    ChevronDown
} from 'lucide-react';
import * as Label from '@radix-ui/react-label';
import * as Select from '@radix-ui/react-select';

import { clientService } from '@/services/client.service';
import { productService } from '@/services/product.service';
import { ReceiptDTO, ReceiptItemDTO } from '@/models/ReceiptDTO';
import { ProductDTO } from '@/models/ProductDTO';
import { ClientDTO } from '@/models/ClientDTO';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ocrService } from '@/services/ocr.service';
import { Switch } from '@/components/ui/switch';

interface ReceiptForm {
    receiptNumber: string;
    receiptDate: string;
    iceNumber: string;
    referenceNumber: string;
    deliveryNoteNumbers: string;
    tvaPercentage: number;
    totalHT: number;
    totalTTC: number;
    paymentTerms: string;
    bankAccount: string;
    bankDetails: string;
    issuingDepartment: string;
    deliveryRef: string;
    deliveryReceived: boolean;
}

interface ReceiptItemForm {
    product: ProductDTO | null;
    quantity: number;
    unitPrice: number;
    lotNumber: string;
    calibrationDate?: string;
    expirationDate?: string;
    articleCode: string;
    description: string;
    unit: string;
    subtotal: number;
}

export const AddReceiptPage: React.FC = () => {
    const navigate = useNavigate();
    const { clientId } = useParams<{ clientId: string }>();

    const [client, setClient] = useState<ClientDTO | null>(null);
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [items, setItems] = useState<ReceiptItemForm[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [ocrResults, setOcrResults] = useState<string[]>([]);
    const [isOcrEnabled, setIsOcrEnabled] = useState(false);
    const [processingFiles, setProcessingFiles] = useState<Record<string, boolean>>({});
    const [ocrLanguage, setOcrLanguage] = useState<string>('fra');

    const onSubmit = async (data: ReceiptForm) => {
        if (!client || items.length === 0) {
            toast.error('Please add at least one item to the receipt');
            return;
        }

        try {
            setIsSubmitting(true);

            // Transform items to ReceiptItemDTO format
            const receiptItems: ReceiptItemDTO[] = items.map(item => ({
                id: 0,
                product: item.product!,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
                lotNumber: item.lotNumber,
                calibrationDate: item.calibrationDate ? new Date(item.calibrationDate) : undefined,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
                articleCode: item.articleCode,
                description: item.description,
                unit: item.unit,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: '',
                updatedBy: ''
            }));

            const { totalHT, totalTTC } = calculateTotals(items);

            // Create receipt
            const receipt: Partial<ReceiptDTO> = {
                receiptNumber: data.receiptNumber,
                receiptDate: new Date(data.receiptDate),
                iceNumber: data.iceNumber,
                referenceNumber: data.referenceNumber,
                deliveryNoteNumbers: data.deliveryNoteNumbers,
                tvaPercentage: data.tvaPercentage,
                totalHT,
                totalTTC,
                totalAmount: totalTTC,
                paymentTerms: data.paymentTerms,
                bankAccount: data.bankAccount,
                bankDetails: data.bankDetails,
                issuingDepartment: data.issuingDepartment,
                deliveryRef: data.deliveryRef,
                deliveryReceived: data.deliveryReceived,
                client,
                receiptItems
            };

            const newReceipt = await clientService.createReceipt(Number(clientId), receipt);

            // Upload attachments
            if (uploadedFiles.length > 0) {
                for (const file of uploadedFiles) {
                    await clientService.addReceiptAttachment(
                        Number(clientId),
                        newReceipt.id,
                        file
                    );
                }
            }

            toast.success('Receipt created successfully');
            navigate(`/clients/${clientId}/receipts`);
        } catch (error) {
            console.error('Error creating receipt:', error);
            toast.error('Failed to create receipt');
        } finally {
            setIsSubmitting(false);
        }
    };

    const { register, handleSubmit, watch, formState: { errors } } =
        useForm<ReceiptForm>({
            defaultValues: {
                receiptDate: new Date().toISOString().split('T')[0],
                tvaPercentage: 0,
                paymentTerms: 'NET 30',
                issuingDepartment: 'DG/DPR',
                deliveryReceived: false
            }
        });

    const watchTVA = watch('tvaPercentage');

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: async (acceptedFiles) => {
            setUploadedFiles(prev => [...prev, ...acceptedFiles]);

            if (isOcrEnabled) {
                // Process each file with OCR
                for (const file of acceptedFiles) {
                    try {
                        // Set loading state for this file
                        setProcessingFiles(prev => ({
                            ...prev,
                            [file.name]: true
                        }));

                        const result = await ocrService.performOcr(file, ocrLanguage);
                        setOcrResults(prev => [...prev, result]);
                    } catch (error) {
                        console.error('OCR processing failed:', error);
                        toast.error(`Failed to process ${file.name} with OCR`);
                    } finally {
                        // Clear loading state for this file
                        setProcessingFiles(prev => ({
                            ...prev,
                            [file.name]: false
                        }));
                    }
                }
            }
        },
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 10485760, // 10MB
        multiple: true
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!clientId) {
                navigate('/clients');
                return;
            }

            try {
                setIsLoading(true);
                const [clientData, productsData] = await Promise.all([
                    clientService.getById(Number(clientId)),
                    productService.getAll(0, 1000)
                ]);

                if (!clientData) {
                    toast.error('Client not found');
                    navigate('/clients');
                    return;
                }

                setClient(clientData);
                setProducts(productsData.content);
            } catch (error) {
                console.error('Error loading initial data:', error);
                toast.error('Failed to load required data');
                navigate('/clients');
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, [clientId, navigate]);

    const handleAddItem = () => {
        setItems([...items, {
            product: null,
            quantity: 0,
            unitPrice: 0,
            lotNumber: '',
            articleCode: '',
            description: '',
            unit: '',
            subtotal: 0
        }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ReceiptItemForm, value: any) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        if (field === 'product' && value) {
            const product = value as ProductDTO;
            newItems[index] = {
                ...newItems[index],
                unitPrice: product.totalCost || 0,
                description: product.description || '',
                unit: 'unit',
                subtotal: newItems[index].quantity * (product.totalCost || 0)
            };
        }

        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].subtotal = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setOcrResults(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotals = (items: ReceiptItemForm[]): { totalHT: number; totalTTC: number } => {
        const totalHT = items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalTTC = totalHT * (1 + (watchTVA / 100));
        return { totalHT, totalTTC };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                            New Receipt for {client?.name}
                        </h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="flex gap-6">
                        {/* Left Column - Main Content */}
                        <div className="flex-grow w-2/3 space-y-6">
                            {/* Basic Information */}
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
                                            <Label.Root>Reference Number</Label.Root>
                                            <Input
                                                {...register('referenceNumber')}
                                                placeholder="Enter reference number"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label.Root>TVA Percentage</Label.Root>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                {...register('tvaPercentage')}
                                                placeholder="Enter TVA percentage"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label.Root>Payment Terms</Label.Root>
                                            <Input
                                                {...register('paymentTerms')}
                                                placeholder="Enter payment terms"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label.Root>Issuing Department</Label.Root>
                                            <Input
                                                {...register('issuingDepartment')}
                                                placeholder="Enter issuing department"
                                            />
                                        </div>

                                        <div className="col-span-2 space-y-2">
                                            <Label.Root>Bank Details</Label.Root>
                                            <Textarea
                                                {...register('bankDetails')}
                                                placeholder="Enter bank details"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Items Section */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Items</CardTitle>
                                    <Button
                                        type="button"
                                        onClick={handleAddItem}
                                        variant="outline"
                                        className="flex items-center gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Item
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {items.map((item, index) => (
                                            <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <Label.Root>Product *</Label.Root>
                                                        <Select.Root
                                                            value={item.product?.id?.toString()}
                                                            onValueChange={(value) => {
                                                                const product = products.find(p => p.id === Number(value));
                                                                handleItemChange(index, 'product', product);
                                                            }}
                                                        >
                                                            <Select.Trigger className="w-full flex h-10 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                                                                <Select.Value placeholder="Select a product" />
                                                            </Select.Trigger>
                                                            <Select.Portal>
                                                                <Select.Content className="overflow-hidden bg-white dark:bg-gray-900 rounded-md shadow-lg">
                                                                    <Select.Viewport className="p-1">
                                                                        {products.map(product => (
                                                                            <Select.Item
                                                                                key={product.id}
                                                                                value={product.id.toString()}
                                                                                className="relative flex h-9 items-center px-8 rounded-sm text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                                                            >
                                                                                <Select.ItemText>{product.name}</Select.ItemText>
                                                                            </Select.Item>
                                                                        ))}
                                                                    </Select.Viewport>
                                                                </Select.Content>
                                                            </Select.Portal>
                                                        </Select.Root>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label.Root>Quantity *</Label.Root>
                                                        <Input
                                                            type="number"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                                                            min="0"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label.Root>Unit Price *</Label.Root>
                                                        <Input
                                                            type="number"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label.Root>Lot Number</Label.Root>
                                                        <Input
                                                            value={item.lotNumber}
                                                            onChange={(e) => handleItemChange(index, 'lotNumber', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label.Root>Calibration Date</Label.Root>
                                                        <Input
                                                            type="date"
                                                            value={item.calibrationDate || ''}
                                                            onChange={(e) => handleItemChange(index, 'calibrationDate', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label.Root>Expiration Date</Label.Root>
                                                        <Input
                                                            type="date"
                                                            value={item.expirationDate || ''}
                                                            onChange={(e) => handleItemChange(index, 'expirationDate', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="col-span-2">
                                                        <Label.Root>Description</Label.Root>
                                                        <Textarea
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            rows={2}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            Subtotal: {item.subtotal.toFixed(2)}
                                                        </p>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Attachments and Summary */}
                        <div className="w-1/3 space-y-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle>Attachments</CardTitle>
                                        <div className="flex items-center gap-4">
                                            <Select.Root value={ocrLanguage} onValueChange={setOcrLanguage}>
                                                <Select.Trigger className="inline-flex h-9 items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100">
                                                    <Select.Value placeholder="Select language" />
                                                    <Select.Icon>
                                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                                    </Select.Icon>
                                                </Select.Trigger>
                                                <Select.Portal>
                                                    <Select.Content className="overflow-hidden rounded-md border border-gray-200 bg-white shadow-md animate-in fade-in-80 dark:border-gray-800 dark:bg-gray-900">
                                                        <Select.Viewport className="p-1">
                                                            <Select.Item value="fra" className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800">
                                                                <Select.ItemText>French</Select.ItemText>
                                                            </Select.Item>
                                                            <Select.Item value="ara" className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800">
                                                                <Select.ItemText>Arabic</Select.ItemText>
                                                            </Select.Item>
                                                            <Select.Item value="ara+fra" className="relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800">
                                                                <Select.ItemText>Arabic + French</Select.ItemText>
                                                            </Select.Item>
                                                        </Select.Viewport>
                                                    </Select.Content>
                                                </Select.Portal>
                                            </Select.Root>

                                            <div className="flex items-center gap-2">
                                                <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    OCR
                                                </Label.Root>
                                                <Switch
                                                    checked={isOcrEnabled}
                                                    onCheckedChange={setIsOcrEnabled}
                                                    className="data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-gray-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div
                                        {...getRootProps()}
                                        className={cn(
                                            "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
                                            isDragActive
                                                ? "border-primary-500 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20"
                                                : "border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400"
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        <div className="flex flex-col items-center">
                                            <Upload className={cn(
                                                "h-12 w-12",
                                                isDragActive
                                                    ? "text-primary-500 dark:text-primary-400"
                                                    : "text-gray-400 dark:text-gray-500"
                                            )} />
                                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                {isDragActive
                                                    ? "Drop the files here..."
                                                    : "Drag and drop files here, or click to select"}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                PDF, PNG, JPG up to 10MB
                                            </p>
                                        </div>
                                    </div>

                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4 space-y-4">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                        <div className="flex items-center overflow-hidden">
                                                            <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mr-2" />
                                                            <span className="text-sm truncate">{file.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {processingFiles[file.name] && (
                                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-primary-500" />
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    {isOcrEnabled && (
                                                        <>
                                                            {processingFiles[file.name] ? (
                                                                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                                    <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                                                        Processing OCR...
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                ocrResults[index] && (
                                                                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                                                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                                                                            OCR Text:
                                                                        </div>
                                                                        <div className="text-sm whitespace-pre-wrap max-h-60 overflow-y-auto 
                                                        bg-white dark:bg-gray-900 p-3 rounded border 
                                                        border-gray-200 dark:border-gray-700">
                                                                            {ocrResults[index]}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Summary</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total HT</span>
                                            <span className="text-lg font-medium">{calculateTotals(items).totalHT.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Total TTC</span>
                                            <span className="text-lg font-medium">{calculateTotals(items).totalTTC.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="max-w-[1600px] mx-auto flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Creating...' : 'Create Receipt'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddReceiptPage;