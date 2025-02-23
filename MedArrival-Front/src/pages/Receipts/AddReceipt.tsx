import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { clientService } from '@/services/client.service';
import { ocrService } from '@/services/ocr.service';

import { ClientDTO } from '@/models/ClientDTO';
import { ProductDTO } from '@/models/ProductDTO';
import { ReceiptForm, ReceiptItemForm } from '@/types/receipt';
import { ReceiptDTO, ReceiptItemDTO } from '@/models/ReceiptDTO';
import { BasicInformation } from '@/components/AddReceipt/BasicInformation';
import { ReceiptItems } from '@/components/AddReceipt/ReceiptItems';
import { Attachments } from '@/components/AddReceipt/Attachments';
import { Summary } from '@/components/AddReceipt/Summary';

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
    const [ocrLanguage, setOcrLanguage] = useState<string>('ar+fr');

    const { register, handleSubmit, watch, formState: { errors } } =
        useForm<ReceiptForm>({
            defaultValues: {
                receiptDate: new Date().toISOString().split('T')[0],
                tvaPercentage: 0,
                paymentTerms: 'NET 30',
                issuingDepartment: 'DG/DPR',
                deliveryReceived: false,
                iceNumber: null,
                referenceNumber: null,
                deliveryNoteNumbers: null,
                bankAccount: null,
                bankDetails: null,
                deliveryRef: null
            }
        });

    const watchTVA = watch('tvaPercentage');

    useEffect(() => {
        const fetchInitialData = async () => {
            if (!clientId) {
                navigate('/clients');
                return;
            }

            try {
                setIsLoading(true);
                const [clientData, availableProducts] = await Promise.all([
                    clientService.getById(Number(clientId)),
                    clientService.getAvailableReceiptProducts(Number(clientId))
                ]);

                if (!clientData) {
                    toast.error('Client not found');
                    navigate('/clients');
                    return;
                }

                setClient(clientData);
                setProducts(availableProducts);
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
            lotNumber: null,
            calibrationDate: null,
            expirationDate: null,
            articleCode: null,
            description: null,
            unit: null,
            subtotal: 0
        }]);
    };
    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: keyof ReceiptItemForm, value: any) => {
        const newItems = [...items];

        if (field === 'quantity' && value) {
            const product = newItems[index].product;
            if (product) {
                const availableProduct = products.find(p => p.id === product.id);
                if (availableProduct && value > availableProduct.availableQuantity) {
                    toast.error(`Maximum available quantity is ${availableProduct.availableQuantity}`);
                    return;
                }
            }
        }

        newItems[index] = {
            ...newItems[index],
            [field]: value
        };

        if (field === 'product' && value) {
            const product = value as ProductDTO;
            newItems[index] = {
                ...newItems[index],
                unitPrice: product.totalCost || 0,
                description: product.description || null,
                unit: 'unit',
                subtotal: newItems[index].quantity * (product.totalCost || 0)
            };
        }

        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].subtotal = newItems[index].quantity * newItems[index].unitPrice;
        }

        setItems(newItems);
    };

    const handleFileUpload = async (acceptedFiles: File[]) => {
        setUploadedFiles(prev => [...prev, ...acceptedFiles]);

        if (isOcrEnabled) {
            for (const file of acceptedFiles) {
                try {
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
                    setProcessingFiles(prev => ({
                        ...prev,
                        [file.name]: false
                    }));
                }
            }
        }
    };

    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setOcrResults(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotals = (items: ReceiptItemForm[]): { totalHT: number; totalTTC: number } => {
        const totalHT = items.reduce((sum, item) => sum + item.subtotal, 0);
        const tvaPercentage = watchTVA || 0;
        const totalTTC = totalHT * (1 + (tvaPercentage / 100));
        return { totalHT, totalTTC };
    };

    const onSubmit = async (data: ReceiptForm) => {
        if (!client || items.length === 0) {
            toast.error('Please add at least one item to the receipt');
            return;
        }

        try {
            setIsSubmitting(true);

            const receiptItems: ReceiptItemDTO[] = items.map(item => ({
                id: 0,
                product: item.product!,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.quantity * item.unitPrice,
                lotNumber: item.lotNumber || null,
                calibrationDate: item.calibrationDate ? new Date(item.calibrationDate) : null,
                expirationDate: item.expirationDate ? new Date(item.expirationDate) : null,
                articleCode: item.articleCode || null,
                description: item.description || null,
                unit: item.unit || null,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: '',
                updatedBy: ''
            }));

            const { totalHT, totalTTC } = calculateTotals(items);

            const receipt: Partial<ReceiptDTO> = {
                receiptNumber: data.receiptNumber,
                receiptDate: new Date(data.receiptDate),
                iceNumber: data.iceNumber || null,
                referenceNumber: data.referenceNumber || null,
                deliveryNoteNumbers: data.deliveryNoteNumbers || null,
                tvaPercentage: data.tvaPercentage || null,
                totalHT,
                totalTTC,
                totalAmount: totalTTC,
                paymentTerms: data.paymentTerms || null,
                bankAccount: data.bankAccount || null,
                bankDetails: data.bankDetails || null,
                issuingDepartment: data.issuingDepartment || null,
                deliveryRef: data.deliveryRef || null,
                deliveryReceived: data.deliveryReceived || null,
                client,
                receiptItems,
                attachments: []
            };

            const newReceipt = await clientService.createReceipt(Number(clientId), receipt);

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
                        <div className="flex-grow w-2/3 space-y-6">
                            <BasicInformation
                                register={register}
                                errors={errors}
                            />
                            <ReceiptItems
                                items={items}
                                products={products}
                                onAddItem={handleAddItem}
                                onRemoveItem={handleRemoveItem}
                                onItemChange={handleItemChange}
                            />
                        </div>

                        <div className="w-1/3 space-y-6">
                            <Attachments
                                uploadedFiles={uploadedFiles}
                                isOcrEnabled={isOcrEnabled}
                                ocrLanguage={ocrLanguage}
                                processingFiles={processingFiles}
                                ocrResults={ocrResults}
                                onFileUpload={handleFileUpload}
                                onFileRemove={removeFile}
                                onOcrToggle={setIsOcrEnabled}
                                onLanguageChange={setOcrLanguage}
                            />
                            <Summary
                                totalHT={calculateTotals(items).totalHT}
                                totalTTC={calculateTotals(items).totalTTC}
                            />
                        </div>
                    </div>

                    <div className="bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="max-w-[1600px] mx-auto flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                className="text-gray-900 dark:text-white"
                                onClick={() => navigate(-1)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center px-4 py-2 rounded-md
  bg-primary-600 hover:bg-primary-700
  text-white font-medium text-sm
  transition-colors duration-150 ease-in-out
  cursor-pointer shadow-sm
  focus-visible:outline focus-visible:outline-2 
  focus-visible:outline-offset-2 focus-visible:outline-primary-600
  disabled:opacity-50 disabled:cursor-not-allowed"
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