import React from 'react';
import { useAdminStore } from '@/store/adminStore';
import { BarChart3, Map, Eye, EyeOff, Activity, TrendingUp } from 'lucide-react';

const AdminControlPanel: React.FC = () => {
  const { 
    isAdminMode, 
    toggleAdminMode, 
    adminLayers, 
    toggleAdminLayer,
    heatmapData 
  } = useAdminStore();

  return (
        <button
          onClick={toggleAdminMode}
          className="bg-white shadow-sm rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors border border-gray-200"
          title="Close Admin Mode"
        >
          {
            isAdminMode ?
              <EyeOff className="w-5 h-5" />
              :
              <BarChart3 className="w-5 h-5 text-gray-700" />
          }
        </button>
  );
};

export default AdminControlPanel;