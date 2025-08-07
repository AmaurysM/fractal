export const ItemCreation = (
    {
        addingItemName,
        setAddingItemName,
        handleAddItemSumit,
        handleAddItemCancel,
    }:{
        addingItemName: string;
        setAddingItemName: (name: string) => void;
        handleAddItemSumit: () => {};
        handleAddItemCancel: () => void;
    }
) => {

    return (
        <div className = "bg-slate-50/50 border-l-2 border-blue-500" >
            <div className="flex items-center gap-2 py-1">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={addingItemName}
                        onChange={(e) => setAddingItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddItemSumit();
                            } else if (e.key === "Escape") {
                                handleAddItemCancel();
                            }
                        }}
                        onBlur={handleAddItemCancel}
                        autoFocus
                        placeholder="Folder name"
                        className="w-full px-2 py-1 text-sm bg-white border border-blue-400 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black"
                        style={{ fontSize: '13px' }}
                    />
                </div>
            </div>
        </div >
    )
}