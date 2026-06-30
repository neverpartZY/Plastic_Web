import { TrendingUp, MapPin, Package, Phone, Building2 } from 'lucide-react'

interface Match {
  id: number
  score: number
  status: string
  dimensionScores: Record<string, number>
  supply_material: string
  supply_form: string
  supply_quantity: number
  supply_price: number
  supply_location: string
  supply_user_name: string
  supply_user_role: string
  demand_material: string
  demand_form: string
  demand_quantity: number
  demand_price: number
  demand_location: string
  demand_user_name: string
  demand_user_role: string
}

export default function MatchCard({ match }: { match: Match }) {
  const scoreColor = match.score >= 80 ? 'text-emerald-600 bg-emerald-50' : match.score >= 60 ? 'text-amber-600 bg-amber-50' : 'text-gray-500 bg-gray-50'
  const scoreBar = match.score >= 80 ? 'bg-emerald-500' : match.score >= 60 ? 'bg-amber-500' : 'bg-gray-400'

  return (
    <div className="bg-white rounded-xl border p-5 hover:border-purple-200 hover:shadow-sm transition-all">
      {/* Score header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-lg text-sm font-black ${scoreColor}`}>{match.score}分</span>
          <span className="text-xs text-gray-400">匹配度</span>
        </div>
        <div className="flex-1 mx-4 h-1.5 rounded-full bg-gray-100">
          <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${match.score}%` }} />
        </div>
        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
          match.status === 'pending' ? 'bg-gray-100 text-gray-600' : match.status === 'contacted' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {match.status === 'pending' ? '待联系' : match.status === 'contacted' ? '已沟通' : '已成单'}
        </span>
      </div>

      {/* Supply vs Demand */}
      <div className="grid grid-cols-2 gap-4">
        {/* Supply side */}
        <div className="bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
          <div className="text-[10px] font-semibold text-emerald-600 uppercase mb-2">供应方</div>
          <div className="text-sm font-bold text-gray-900">{match.supply_material} {match.supply_form}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Package className="h-3 w-3" />{match.supply_quantity}吨/月</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{match.supply_location}</span>
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-1">
            {match.supply_price > 0 ? `¥${match.supply_price.toLocaleString()}元/吨` : '价格面议'}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
            <Building2 className="h-3 w-3" />{match.supply_user_name} · <span className="text-gray-400">{match.supply_user_role}</span>
          </div>
        </div>

        {/* Demand side */}
        <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
          <div className="text-[10px] font-semibold text-blue-600 uppercase mb-2">需求方</div>
          <div className="text-sm font-bold text-gray-900">{match.demand_material} {match.demand_form}</div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Package className="h-3 w-3" />{match.demand_quantity}吨/月</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{match.demand_location}</span>
          </div>
          <div className="text-xs text-emerald-700 font-bold mt-1">
            {match.demand_price > 0 ? `¥${match.demand_price.toLocaleString()}元/吨` : '价格面议'}
          </div>
          <div className="flex items-center gap-2 mt-2 text-[11px] text-gray-400">
            <Building2 className="h-3 w-3" />{match.demand_user_name} · <span className="text-gray-400">{match.demand_user_role}</span>
          </div>
        </div>
      </div>

      {/* Dimension scores */}
      {match.dimensionScores && Object.keys(match.dimensionScores).length > 0 && (
        <div className="flex items-center gap-3 mt-3 pt-3 border-t">
          {Object.entries(match.dimensionScores).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1 text-[11px]">
              <span className="text-gray-500">{key}</span>
              <span className={`font-semibold ${typeof val === 'number' && val >= 8 ? 'text-emerald-600' : 'text-gray-400'}`}>{typeof val === 'number' ? val.toFixed(0) : val}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
