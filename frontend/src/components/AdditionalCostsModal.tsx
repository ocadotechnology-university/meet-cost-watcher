import React, { useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import {AdditionalCost} from "src/types/responseTypes";

type EditCostModalProps = {
    cost?: AdditionalCost;
    onSave: (name: string,  cost: number, id?: number) => void;
    onClose: () => void;
    onDelete?: () => void;
    canEdit: boolean;
}

export const EditCostModal = ({ cost, onSave, onClose, onDelete, canEdit }: EditCostModalProps) => {
    const [name, setName] = useState(cost?.name ?? '');
    const [amount, setAmount] = useState(cost?.cost ?? 0);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name,amount,cost?.id);
    };

    return (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50">
            <div className="bg-custom-grey opacity-100 rounded-lg border-2 border-blue-main  p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg text-blue-main font-semibold">
                        {cost ? 'Edytuj koszt' : 'Dodaj nowy koszt'}
                    </h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Nazwa kosztu
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white w-full p-2 border border-blue-main rounded"
                            required
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                            Kwota (zł)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(parseInt(e.target.value))}
                            className="bg-white w-full p-2 border border-blue-main rounded"
                            required
                            disabled={!canEdit}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        {cost && onDelete && canEdit && (
                            <button
                                type="button"
                                onClick={onDelete}
                                className="px-4 py-2 bg-red-800 text-white rounded hover:bg-red-700"
                            >
                                Usuń
                            </button>
                        )}
                        {canEdit && (
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-main text-white rounded hover:bg-blue-800"
                            >
                                {cost ? 'Zapisz' : 'Dodaj'}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};