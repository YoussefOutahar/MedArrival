import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Paperclip, Download, Trash2, Upload, FileText } from 'lucide-react';
import { ReceiptAttachmentDTO, ReceiptDTO } from '@/models/ReceiptDTO';
import { clientService } from '@/services/client.service';
import { formatDate, formatFileSize } from '@/utils/formatters';

const ReceiptAttachments: React.FC = () => {
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
            toast.error('Failed to fetch data');
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
            toast.success('Attachment uploaded successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to upload attachment');
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
            toast.error('Failed to download attachment');
        }
    };

    const handleDelete = async (attachmentId: number) => {
        if (!window.confirm('Are you sure you want to delete this attachment?')) {
            return;
        }

        try {
            await clientService.deleteReceiptAttachment(
                parseInt(clientId!),
                parseInt(receiptId!),
                attachmentId
            );
            toast.success('Attachment deleted successfully');
            setAttachments(attachments.filter(a => a.id !== attachmentId));
        } catch (error) {
            toast.error('Failed to delete attachment');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-2">
                            <Paperclip className="h-5 w-5 text-gray-500" />
                            <h1 className="text-lg font-medium text-gray-900 dark:text-white">
                                Receipt Attachments
                            </h1>
                        </div>
                        <div>
                            <label className="inline-flex items-center px-4 py-2 rounded-md
          bg-primary hover:bg-opacity-90
          text-primary-foreground font-medium text-sm
          transition-colors duration-150 ease-in-out
          cursor-pointer shadow-sm
          focus-visible:outline focus-visible:outline-2 
          focus-visible:outline-offset-2 focus-visible:outline-primary
          disabled:opacity-50 disabled:cursor-not-allowed">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload New Attachment
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Attachments Section */}
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600" />
                    </div>
                ) : attachments.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
                        <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No attachments</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Upload a new attachment to get started.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {attachments.map((attachment) => (
                                <li
                                    key={attachment.id}
                                    className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    <div className="flex items-center gap-4">
                                        <Paperclip className="h-5 w-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                {attachment.originalName}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatFileSize(attachment.fileSize)} • Added {formatDate(attachment.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleDownload(attachment.id, attachment.originalName)}
                                            className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                                        >
                                            <Download className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(attachment.id)}
                                            className="p-2 text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Receipt Details Section */}
                {receipt && (
                    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                        <div className="px-6 py-4">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="h-5 w-5 text-gray-400" />
                                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                                    Receipt Details
                                </h2>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Receipt Number</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {receipt.receiptNumber}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {formatDate(receipt.receiptDate)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        ${receipt.totalAmount?.toFixed(2)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Reference Number</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {receipt.referenceNumber || '-'}
                                    </p>
                                </div>
                                {receipt.iceNumber && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ICE Number</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {receipt.iceNumber}
                                        </p>
                                    </div>
                                )}
                                {receipt.deliveryNoteNumbers && (
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Delivery Notes</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                            {receipt.deliveryNoteNumbers}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReceiptAttachments;