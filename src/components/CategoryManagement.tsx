import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Tag, Save, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

export function CategoryManagement({ 
  categories, 
  addCategory, 
  deleteCategory, 
  updateCategory 
}: { 
  categories: Category[], 
  addCategory: (name: string) => Promise<void>,
  deleteCategory: (id: string) => Promise<void>,
  updateCategory: (id: string, name: string) => Promise<void>
}) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleAdd = async () => {
    if (newCategory) {
      await addCategory(newCategory);
      setNewCategory('');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCategory(id);
  };

  const handleSave = async (id: string) => {
    await updateCategory(id, editValue);
    setIsEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
         <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Tag className="text-purple-600" /> Category Management
         </h2>
         <div className="flex gap-2">
            <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New Category..."
                className="px-4 py-2 border border-gray-200 rounded-xl outline-none text-sm"
            />
            <button onClick={handleAdd} className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2 font-bold text-sm">
                <Plus className="w-4 h-4" /> Add
            </button>
         </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="group flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-all shadow-sm">
              {isEditing === cat.id ? (
                  <div className="flex items-center gap-2 w-full">
                    <input value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-full p-2 rounded-lg border text-sm"/>
                    <button onClick={() => handleSave(cat.id)}><Check className="text-green-600 w-5 h-5"/></button>
                  </div>
              ) : (
                <>
                    <span className="font-bold text-gray-700 text-sm">
                      {cat.name.replace(/^[০-৯]+\.\s+/, '').replace(/^\d+\.\s+/, '')}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setIsEditing(cat.id); setEditValue(cat.name); }} className='p-1.5 hover:bg-gray-100 rounded-lg'><Edit2 className="text-blue-500 w-4 h-4"/></button>
                        <button onClick={() => handleDelete(cat.id)} className='p-1.5 hover:bg-gray-100 rounded-lg'><Trash2 className="text-red-500 w-4 h-4"/></button>
                    </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
