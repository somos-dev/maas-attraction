import React from 'react'
import SearchHeader from './SearchHeader'
import MapStyleSelector from './MapStyleSelector'
import { Button } from './ui/button'
import { Settings } from 'lucide-react'
import TripManager from './TripManager'
import { useTripManagerStore } from '@/store/tripStore'

type Props = {
}

const MapNavbar = () => {

const {isTripManagerOpen, toggleTripManager} = useTripManagerStore()


  return (
    <div className="absolute top-2 z-10 p-3 flex flex-col sm:flex-row sm:items-start gap-3 w-full bg-transparent">

      {/* Search Header */}
      <div className="flex-1 min-w-0">
        <SearchHeader/>
      </div>

      {/* Map style selector */}
      <div className="flex-shrink-0 bg-tansparent">
        <MapStyleSelector
        />
      </div>

      {/* <div className="flex-shrink-0 hidden sm:block">
        <div className='relative'>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTripManager}
            className="bg-white/90 backdrop-blur-sm h-10"
          >
            <Settings className="h-4 w-4" />
          </Button>
          {isTripManagerOpen && (
            <div className="absolute top-12 right-4 z-10 w-80">
              <TripManager/>
            </div>
          )}
        </div>
      </div> */}

    </div>
  )
}

export default MapNavbar