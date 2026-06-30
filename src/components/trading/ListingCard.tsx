import { MapPin, Package, Calendar, Tag } from 'lucide-react'

interface Listing {
  id: number
  type: string
  material: string
  form: string
  quantity: number
  price: number
  price_negotiable: number
  location: string
  specs: string
  notes: string
  waste_or_recycled: string
  status: string
  created_at: string
}

export default function ListingCard({ listing }: { listing: Listing }) {
  const isSupply = listing.type === 'supply'
  const isNegotiable = listing.priceNegotiable === 1 || listing.price === 0

  return (
    <div className="bg-white rounded-xl border p-5 hover:border-emerald-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Top row: type badge + material */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isSupply ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {isSupply ? '供应' : '需求'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
              {listing.wasteOrRecycled}
            </span>
            <span className="text-sm font-bold text-gray-900">{listing.material}</span>
            <span className="text-xs text-gray-400">{listing.form}</span>
          </div>

          {/* Specs & notes */}
          {listing.specs && (
            <p className="text-xs text-gray-500 mb-1 line-clamp-1">
              <Tag className="inline h-3 w-3 mr-1 text-gray-300" />
              {listing.specs}
            </p>
          )}
          {listing.notes && (
            <p className="text-xs text-gray-400 line-clamp-1 mb-2">{listing.notes}</p>
          )}

          {/* Bottom info */}
          <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />{listing.location}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />{listing.createdAt?.slice(0, 10)}
            </span>
          </div>
        </div>

        {/* Right: quantity & price */}
        <div className="text-right flex-shrink-0">
          <div className="flex items-center gap-1 justify-end">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-lg font-bold text-gray-900">{listing.quantity}</span>
            <span className="text-xs text-gray-500">吨/月</span>
          </div>
          <div className="mt-1">
            {isNegotiable ? (
              <span className="text-sm font-semibold text-amber-600">价格面议</span>
            ) : (
              <span className="text-lg font-bold text-emerald-700">¥{listing.price?.toLocaleString()}</span>
            )}
          </div>
          {!isNegotiable && <div className="text-[10px] text-gray-400">元/吨</div>}
        </div>
      </div>
    </div>
  )
}
