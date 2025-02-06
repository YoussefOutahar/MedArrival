interface TableWrapperProps {
    children: React.ReactNode;
}

export function TableWrapper({ children }: TableWrapperProps) {
    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}