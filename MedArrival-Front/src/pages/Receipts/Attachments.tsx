import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    Paperclip,
    Download,
    Trash2,
    Upload,
    FileText,
    ArrowLeft,
    Calendar,
    CreditCard,
    Hash
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReceiptAttachmentDTO, ReceiptDTO } from '@/models/ReceiptDTO';
import { clientService } from '@/services/client.service';
import { formatDate, formatFileSize } from '@/utils/formatters';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ReceiptAttachments: React.FC = () => {
    const { t } = useTranslation('receipts');
    const navigate = useNavigate();
    const { clientId, receiptId } = useParams<{ clientId: string; receiptId: string }>();
    const [attachments, setAttachments] = useState<ReceiptAttachmentDTO[]>([]);
    const [receipt, setReceipt] = useState<ReceiptDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (clientId && receiptId) {
            fetchData();
        }
    }, [clientId, receiptId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [attachmentsResponse, receiptResponse] = await Promise.all([
                clientService.getReceiptAttachments(parseInt(clientId!), parseInt(receiptId!)),
                clientService.getClientReceipt(parseInt(clientId!), parseInt(receiptId!))
            ]);
            setAttachments(attachmentsResponse);
            setReceipt(receiptResponse);
        } catch (error) {
            toast.error(t('attachments.errors.fetchFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            await clientService.addReceiptAttachment(
                parseInt(clientId!),
                parseInt(receiptId!),
                file
            );
            toast.success(t('attachments.success.uploaded'));
            fetchData();
        } catch (error) {
            toast.error(t('attachments.errors.uploadFailed'));
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (attachmentId: number, fileName: string) => {
        try {
            const blob = await clientService.downloadReceiptAttachment(
                parseInt(clientId!),
                parseInt(receiptId!),
                attachmentId
            );

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error(t('attachments.errors.downloadFailed'));
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!window.confirm(t('attachments.confirmDelete'))) {
            return;
        }

        try {
            await clientService.deleteReceiptAttachment(
                parseInt(clientId!),
                parseInt(receiptId!),
                attachmentId
            );
            toast.success(t('attachments.success.deleted'));
            setAttachments(attachments.filter(a => a.id !== attachmentId));
        } catch (error) {
            toast.error(t('attachments.errors.deleteFailed'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 
                                     transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        </button>
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                                {t('attachments.header.title')}
                            </h1>
                        </div>
                    </div>
                    <div>
                        <label className="inline-flex items-center px-4 py-2 rounded-md
                                      bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 
                                      dark:hover:bg-primary-600 text-white font-medium text-sm 
                                      transition-colors cursor-pointer shadow-sm">
                            <Upload className="h-4 w-4 mr-2" />
                            {t('attachments.buttons.upload')}
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileUpload}
                                disabled={uploading}
                                accept=".pdf,.jpg,.jpeg,.png"
                            />
                        </label>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Attachments List */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Paperclip className="h-5 w-5 text-gray-400" />
                                <CardTitle className="text-gray-900 dark:text-white">{t('attachments.list.title')}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 
                                                  border-primary-600 dark:border-primary-400" />
                                </div>
                            ) : attachments.length === 0 ? (
                                <div className="text-center py-12">
                                    <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                                        {t('attachments.emptyState.title')}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                        {t('attachments.emptyState.description')}
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {attachments.map((attachment) => (
                                        <div key={attachment.id}
                                            className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                            <div className="flex items-center gap-4">
                                                <FileText className="h-8 w-8 text-gray-400" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {attachment.originalName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(attachment.fileSize)} •
                                                        {t('attachments.list.addedOn', {
                                                            date: formatDate(attachment.createdAt)
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDownload(
                                                        attachment.id,
                                                        attachment.originalName
                                                    )}
                                                >
                                                    <Download className="h-4 w-4 text-gray-900 dark:text-white" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(attachment.id)}
                                                    className="text-red-500 hover:text-red-700 
                                                             hover:bg-red-50 dark:hover:bg-red-900/20"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Receipt Details */}
                    {receipt && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <CardTitle className="text-gray-900 dark:text-white">{t('attachments.receiptDetails.title')}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 
                                                    flex items-center gap-2">
                                            <Hash className="h-4 w-4" />
                                            {t('attachments.receiptDetails.receiptNumber')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {receipt.receiptNumber}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 
                                                    flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {t('attachments.receiptDetails.date')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {formatDate(receipt.receiptDate)}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 
                                                    flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            {t('attachments.receiptDetails.amount')}
                                        </p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {t('common.currency', {
                                                amount: receipt.totalAmount?.toFixed(2)
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReceiptAttachments;