import React from 'react';
import { Plus, FileText, Paperclip } from 'lucide-react';
import { ClientDTO } from '@/models/ClientDTO';
import { ACTIONS } from './Actions';

interface ClientRowProps {
    client: ClientDTO;
    onAction: (type: string, clientId: number) => void;
}

const ClientRow: React.FC<ClientRowProps> = ({ client, onAction }) => {
    return (
        <div className="flex items-center justify-between py-4 px-6 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex-1">
                <div className="flex items-center gap-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {client.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {client.address}
                        </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200">
                        {client.clientType}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => onAction(ACTIONS.VIEW_ATTACHMENTS, client.id)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    title={ACTIONS.VIEW_ATTACHMENTS}
                >
                    <Paperclip className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onAction(ACTIONS.NEW_RECEIPT, client.id)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    title={ACTIONS.NEW_RECEIPT}
                >
                    <Plus className="h-5 w-5" />
                </button>
                <button
                    onClick={() => onAction(ACTIONS.VIEW_RECEIPTS, client.id)}
                    className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                    title={ACTIONS.VIEW_RECEIPTS}
                >
                    <FileText className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

export default ClientRow;