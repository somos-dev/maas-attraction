import React from 'react';
import { useAdminStore } from '@/store/adminStore';
import { BarChart3, EyeOff} from 'lucide-react';

const AdminControlPanelContent: React.FC = () => {
  const {
    isAdminMode,
    toggleAdminMode,
    adminLayers,
    toggleAdminLayer,
    heatmapData
  } = useAdminStore();

  return (
    <div className="bg-white p-3 w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Admin Dashboard</h3>
        </div>
        <button
          onClick={toggleAdminMode}
          className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
          title="Close Admin Mode"
        >
          {
            isAdminMode ?
              <EyeOff className="w-5 h-5" />
              :
              <BarChart3 className="w-5 h-5 text-gray-700" />
          }
        </button>
      </div>

      {/* Layer Controls */}
      {/* <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
          <Map className="w-4 h-4" />
          Map Layers
        </h4>
        <div className="space-y-2">
          <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-700">Request Heatmap</span>
            </div>
            <input
              type="checkbox"
              checked={adminLayers.heatmap}
              onChange={() => toggleAdminLayer('heatmap')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-700">Analytics Overlay</span>
            </div>
            <input
              type="checkbox"
              checked={adminLayers.analytics}
              onChange={() => toggleAdminLayer('analytics')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-700">Usage Insights</span>
            </div>
            <input
              type="checkbox"
              checked={adminLayers.insights}
              onChange={() => toggleAdminLayer('insights')}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
          </label>
        </div>
      </div> */}

      {/* Statistics */}
      <div className="">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>

        {heatmapData ? (
          <div className="space-y-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium mb-1">Total Requests</div>
              <div className="text-2xl font-bold text-blue-900">
                {heatmapData.totalRequests.toLocaleString()}
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-xs text-green-600 font-medium mb-1">Top Location</div>
              <div className="text-sm font-semibold text-green-900 truncate">
                {heatmapData.topLocations[0]?.type === 'origin' ? 'Origin' : 'Destination'}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {heatmapData.topLocations[0]?.requests.toLocaleString()} requests
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {heatmapData.topLocations[0]?.lat.toFixed(4)}, {heatmapData.topLocations[0]?.lon.toFixed(4)}
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-3">
              <div className="text-xs text-orange-600 font-medium mb-1">Peak Hour</div>
              <div className="text-sm font-semibold text-orange-900">
                {heatmapData.peakHours[0]?.hour}:00 - {(heatmapData.peakHours[0]?.hour || 0) + 1}:00
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {heatmapData.peakHours[0]?.requests.toLocaleString()} requests
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center py-4">
            Turn on the Heatmap layer to view statistics.
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="bg-blue-50 rounded p-2">
          <p className="text-xs text-blue-600">
            <span className="font-medium">💡 Tip:</span> Zoom in to see individual stops. Heatmap shows density at lower zoom levels.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminControlPanelContent;