import React from 'react';
import { DollarSign, Check, StickyNote, Plus } from 'lucide-react';

const QuickActions = ({ onAddExpense, onMarkNextVisited, onAddNote }) => {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {/* Mark Next Visited - Only show if there's a next place */}
      {onMarkNextVisited && (
        <button
          onClick={onMarkNextVisited}
          className="w-14 h-14 bg-[#26DE81] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="Mark next visited"
        >
          <Check size={24} />
        </button>
      )}

      {/* Add Expense */}
      <button
        onClick={onAddExpense}
        className="w-14 h-14 bg-gradient-to-r from-[#FFE66D] to-[#F7B731] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
        title="Add expense"
      >
        <DollarSign size={24} />
      </button>

      {/* Add Note - Optional for future */}
      {onAddNote && (
        <button
          onClick={onAddNote}
          className="w-14 h-14 bg-[#4ECDC4] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all flex items-center justify-center"
          title="Add note"
        >
          <StickyNote size={24} />
        </button>
      )}
    </div>
  );
};

export default QuickActions;
