import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isDeleting?: boolean;
}

export function DeleteConfirmationDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    isDeleting = false,
}: DeleteConfirmationDialogProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 dark:bg-black/40" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl 
                                                   bg-white dark:bg-gray-800 p-6 text-left align-middle 
                                                   shadow-xl transition-all">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full 
                                                      bg-red-100 dark:bg-red-900/30 
                                                      flex items-center justify-center">
                                            <ExclamationTriangleIcon className="h-5 w-5 
                                                                              text-red-600 dark:text-red-400" />
                                        </div>
                                        <Dialog.Title className="ml-3 text-lg font-medium 
                                                               text-gray-900 dark:text-white">
                                            {title}
                                        </Dialog.Title>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 
                                                 dark:text-gray-500 dark:hover:text-gray-400 
                                                 transition-colors"
                                    >
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
                                </div>

                                <div className="mt-6 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                                                 bg-white dark:bg-gray-800 border border-gray-300 
                                                 dark:border-gray-600 rounded-md hover:bg-gray-50 
                                                 dark:hover:bg-gray-700/50 focus:outline-none focus:ring-2 
                                                 focus:ring-offset-2 focus:ring-primary-500
                                                 dark:focus:ring-offset-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onConfirm}
                                        disabled={isDeleting}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium 
                                                 text-white bg-red-600 dark:bg-red-500 border border-transparent 
                                                 rounded-md hover:bg-red-700 dark:hover:bg-red-600 
                                                 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                                 focus:ring-red-500 dark:focus:ring-offset-gray-900 
                                                 disabled:opacity-50 disabled:cursor-not-allowed
                                                 transition-colors"
                                    >
                                        {isDeleting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 
                                                              border-b-2 border-white mr-2" />
                                                Deleting...
                                            </>
                                        ) : (
                                            'Delete'
                                        )}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}