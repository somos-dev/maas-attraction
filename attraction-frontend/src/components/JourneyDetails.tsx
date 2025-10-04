import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Bike,
  Bus,
  Car,
  Navigation,
  Clock,
  MapPin,
  MoreHorizontal
} from 'lucide-react';
import useLocales from '@/hooks/useLocales';

import {Route, Legs, Coordinates} from '@/app/api/plan-trip/route';


// Types based on your API structure
// type Coordinates = {
//   lat: number;
//   lon: number;
// };

// type Step = {
//   type: string;
//   from: string;
//   to: string;
//   duration: string;
//   start_time: string;
//   end_time: string;
//   geometry: string | Coordinates[];
//   route?: string;
// };

// type Route = {
//   id: string;
//   fromStationName: string;
//   toStationName: string;
//   mode: string;
//   duration: number;
//   distance: number;
//   steps: Step[];
// };

interface JourneyDetailsProps {
  selectedRoute: Route | null;
}

const JourneyDetails: React.FC<JourneyDetailsProps> = ({ selectedRoute }) => {
  const { translate } = useLocales();
  
  if (!selectedRoute) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="font-semibold text-gray-800 mb-2">{String(translate('common.chooseYourRoute'))}</h3>
        <p className="text-sm text-gray-500">{String(translate('common.selectRouteToSeeDetails'))}</p>
      </div>
    );
  }

  const formatTime = (sec: number) => {
    const minutes = Math.round(sec / 60);
    if (minutes < 60) return `${minutes}${String(translate('common.minutes'))}`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}${String(translate('common.hours'))}${mins > 0 ? ` ${mins}${String(translate('common.minutes'))}` : ''}`;
  };


  const formatDistance = (m: number) => {
    return m < 1000 ? `${m.toFixed(0)}${String(translate('common.meters'))}` : `${(m / 1000).toFixed(1)}${String(translate('common.kilometers'))}`
  };

  const getModeIcon = (mode: string) => {
    const props = { className: "h-5 w-5" };
    switch (mode.toLowerCase()) {
      case 'walk': return <Navigation {...props} />;
      case 'bicycle': return <Bike {...props} />;
      case 'bus': return <Bus {...props} />;
      case 'car': return <Car {...props} />;
      default: return <Navigation {...props} />;
    }
  };

  const getStepIcon = (type: string) => {
    const props = { className: "h-4 w-4" };
    switch (type.toLowerCase()) {
      case 'walk': return <Navigation {...props} />;
      case 'bicycle': return <Bike {...props} />;
      case 'bus': return <Bus {...props} />;
      case 'car': return <Car {...props} />;
      default: return <Navigation {...props} />;
    }
  };

  const getModeGradient = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'walk': return 'from-emerald-500 to-green-600';
      case 'bus': return 'from-blue-500 to-indigo-600';
      case 'bicycle': return 'from-purple-500 to-violet-600';
      case 'car': return 'from-orange-500 to-red-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getStepColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'walk': return 'text-emerald-600 bg-emerald-50';
      case 'bus': return 'text-blue-600 bg-blue-50';
      case 'bicycle': return 'text-purple-600 bg-purple-50';
      case 'car': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStepBorder = (type: string) => {
    switch (type.toLowerCase()) {
      case 'walk': return 'border-l-emerald-400';
      case 'bus': return 'border-l-blue-400';
      case 'bicycle': return 'border-l-purple-400';
      case 'car': return 'border-l-orange-400';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className={`bg-gradient-to-r ${getModeGradient(selectedRoute.mode)} p-5 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              {getModeIcon(selectedRoute.mode)}
            </div>
            <div>
              <h2 className="text-xl font-bold capitalize">{String(translate('directions.routeType'))}</h2>
              <p className="text-white/80 text-sm">{selectedRoute.steps?.length || 0} {String(translate('common.steps'))}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{formatTime(selectedRoute.totalDuration)}</div>
            <div className="text-white/80 text-sm">{formatDistance(selectedRoute.totalDistance)}</div>
            {/* <div className="text-white/80 text-sm">{selectedRoute.totalDistance}</div> */}
          </div>
        </div>
      </div>

      {/* Route overview */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="font-medium">{selectedRoute.fromStationName}</span>
          <MoreHorizontal className="h-4 w-4" />
          <MapPin className="h-4 w-4 text-red-600" />
          <span className="font-medium">{selectedRoute.toStationName}</span>
        </div>
      </div>

      {/* Journey Steps */}
      <div className="divide-y divide-gray-100">
        {selectedRoute.steps && selectedRoute.steps.length > 0 ? (
          selectedRoute.steps.map((step, index) => (
            <div key={index} className="p-4">
              {/* Step Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getStepColor(step.type)}`}>
                    {getStepIcon(step.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {step.type.toUpperCase()}
                    </Badge>
                    {step.route && (
                      <Badge className="text-xs bg-blue-600 hover:bg-blue-700 text-white">
                        {String(translate('directions.route'))} {step.route}
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-600">{step.duration}</span>
              </div>

              {/* Step Content */}
              <div className={`pl-2 border-l-4 ${getStepBorder(step.type)}`}>
                {/* From-To locations */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 break-words leading-relaxed">
                        {step.from}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>
                    <div className="flex-1">
                      <span className="font-medium text-gray-800 break-words leading-relaxed">
                        {step.to}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timing for bus routes */}
                {step.start_time && step.end_time && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">
                          {String(translate('common.depart'))} {new Date(step.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>                      
                      </div>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{String(translate('common.arrive'))} {new Date(step.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <MapPin className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm">{String(translate('common.noJourneySteps'))}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JourneyDetails;