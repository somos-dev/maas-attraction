import React from 'react'

type Props = {}

const RandomContent = (props: Props) => {
    return (
        <div>       
            <section>
                <p className="text-sm text-gray-500 mb-1">Hotels nearby</p>
                <ul className="space-y-3">
                    {[
                        { name: "Hotel Marconi", price: 81 },
                        { name: "Best Western Premier Villa Fabiano", price: 90 },
                    ].map((hotel) => (
                        <li
                            key={hotel.name}
                            className="border rounded-lg p-4 flex items-center justify-between"
                        >
                            <span>{hotel.name}</span>
                            <span className="font-medium">€{hotel.price}</span>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h3 className="mb-2 font-semibold">Photos</h3>
                <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

export default RandomContent