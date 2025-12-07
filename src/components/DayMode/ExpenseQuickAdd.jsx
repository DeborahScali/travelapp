import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';

const ExpenseQuickAdd = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'food',
  });

  const categories = [
    { value: 'food', label: 'Food', emoji: '🍽️' },
    { value: 'transport', label: 'Transport', emoji: '🚗' },
    { value: 'accommodation', label: 'Hotel', emoji: '🏨' },
    { value: 'activities', label: 'Activities', emoji: '🎭' },
    { value: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { value: 'other', label: 'Other', emoji: '💰' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description.trim()) {
      alert('Please enter amount and description');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FFE66D] to-[#F7B731] rounded-full flex items-center justify-center">
              <DollarSign size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Quick Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Amount (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFE66D] text-lg font-semibold"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Lunch at cafe"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#FFE66D]"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value })}
                  className={`px-3 py-3 rounded-xl border-2 transition-all text-center ${
                    formData.category === cat.value
                      ? 'border-[#FFE66D] bg-[#FFE66D]/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#FFE66D] to-[#F7B731] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseQuickAdd;
