// Attachments.tsx
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, ChevronDown, Languages } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface AttachmentsProps {
    uploadedFiles: File[];
    isOcrEnabled: boolean;
    ocrLanguage: string;
    processingFiles: Record<string, boolean>;
    ocrResults: string[];
    onFileUpload: (files: File[]) => void;
    onFileRemove: (index: number) => void;
    onOcrToggle: (enabled: boolean) => void;
    onLanguageChange: (language: string) => void;
}

export const Attachments: React.FC<AttachmentsProps> = ({
    uploadedFiles,
    isOcrEnabled,
    ocrLanguage,
    processingFiles,
    ocrResults,
    onFileUpload,
    onFileRemove,
    onOcrToggle,
    onLanguageChange
}) => {
    const { t } = useTranslation('receipts');
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileUpload,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 10485760, // 10MB
        multiple: true
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gray-900 dark:text-white" />
                    <CardTitle className="text-gray-900 dark:text-white">{t('receipts.addReceipt.attachments.title')}</CardTitle>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {t('receipts.addReceipt.attachments.ocr.label')}
                        </Label.Root>
                        <Switch
                            checked={isOcrEnabled}
                            onCheckedChange={onOcrToggle}
                        />
                    </div>
                    {isOcrEnabled && (
                        <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4 text-gray-400" />
                            <Select.Root value={ocrLanguage} onValueChange={onLanguageChange}>
                                <Select.Trigger className="inline-flex h-9 items-center justify-between 
                                    rounded-md border border-gray-300 dark:border-gray-600 
                                    bg-white dark:bg-gray-800 px-3 py-2 text-sm 
                                    focus:outline-none focus:ring-2 focus:ring-primary-500 
                                    dark:focus:ring-primary-400 text-gray-900 dark:text-white">
                                    <Select.Value />
                                    <Select.Icon>
                                        <ChevronDown className="h-4 w-4 opacity-50" />
                                    </Select.Icon>
                                </Select.Trigger>
                                <Select.Portal>
                                    <Select.Content className="overflow-hidden rounded-md border 
                                        border-gray-200 bg-white shadow-md dark:border-gray-700 
                                        dark:bg-gray-800 text-gray-900 dark:text-white">
                                        <Select.Viewport className="p-1">
                                            <Select.Item value="fr" className="relative flex cursor-default 
                                                select-none items-center rounded-sm py-1.5 pl-8 pr-2 
                                                text-sm outline-none focus:bg-primary-50 
                                                dark:focus:bg-primary-900/20 text-gray-900 dark:text-white">
                                                <Select.ItemText>
                                                    {t('receipts.addReceipt.attachments.language.options.french')}
                                                </Select.ItemText>
                                            </Select.Item>
                                            <Select.Item value="ar" className="relative flex cursor-default 
                                                select-none items-center rounded-sm py-1.5 pl-8 pr-2 
                                                text-sm outline-none focus:bg-primary-50 
                                                dark:focus:bg-primary-900/20 text-gray-900 dark:text-white">
                                                <Select.ItemText>
                                                    {t('receipts.addReceipt.attachments.language.options.arabic')}
                                                </Select.ItemText>
                                            </Select.Item>
                                            <Select.Item value="ar+fr" className="relative flex cursor-default 
                                                select-none items-center rounded-sm py-1.5 pl-8 pr-2 
                                                text-sm outline-none focus:bg-primary-50 
                                                dark:focus:bg-primary-900/20 text-gray-900 dark:text-white">
                                                <Select.ItemText>
                                                    {t('receipts.addReceipt.attachments.language.options.both')}
                                                </Select.ItemText>
                                            </Select.Item>
                                        </Select.Viewport>
                                    </Select.Content>
                                </Select.Portal>
                            </Select.Root>
                        </div>
                    )}
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
                                ? t('receipts.addReceipt.attachments.dropzone.activeText')
                                : t('receipts.addReceipt.attachments.dropzone.text')}
                        </p>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {t('receipts.addReceipt.attachments.dropzone.subtext')}
                        </p>
                    </div>
                </div>

                {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-4">
                        {uploadedFiles.map((file, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between p-3 bg-gray-50 
                                    dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center overflow-hidden">
                                        <FileText className="h-4 w-4 text-gray-400 flex-shrink-0 mr-2" />
                                        <span className="text-sm truncate text-gray-700 dark:text-gray-300">
                                            {file.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {processingFiles[file.name] && (
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 
                                                border-primary-500 border-t-transparent" />
                                        )}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onFileRemove(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 
                                                dark:hover:bg-red-900/20"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {isOcrEnabled && ocrResults[index] && (
                                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 
                                        overflow-hidden">
                                        <div className="p-4 bg-gray-50 dark:bg-gray-800">
                                            <div className="text-sm font-medium text-gray-700 
                                                dark:text-gray-300 mb-2">
                                                {t('receipts.addReceipt.attachments.ocr.result')}
                                            </div>
                                            <div className="text-sm whitespace-pre-wrap max-h-60 
                                                overflow-y-auto bg-white dark:bg-gray-900 p-3 
                                                rounded border border-gray-200 dark:border-gray-700">
                                                {ocrResults[index]}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Attachments;