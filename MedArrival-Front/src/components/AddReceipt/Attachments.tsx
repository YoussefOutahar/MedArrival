import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Upload, X, FileText, ChevronDown } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// const toggleVariants = {
//     base: "peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=unchecked]:bg-gray-200 dark:focus-visible:ring-primary-400 dark:focus-visible:ring-offset-gray-900 dark:data-[state=checked]:bg-primary-600 dark:data-[state=unchecked]:bg-gray-700",
//     thumb: "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
// };

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
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: onFileUpload,
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png']
        },
        maxSize: 10485760,
        multiple: true
    });

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Attachments</CardTitle>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Label.Root className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                OCR
                            </Label.Root>
                            <Switch
                                checked={isOcrEnabled}
                                onCheckedChange={onOcrToggle}
                            />
                        </div>
                        <Select.Root value={ocrLanguage} onValueChange={onLanguageChange}>
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
                                            onClick={() => onFileRemove(index)}
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
    );
};