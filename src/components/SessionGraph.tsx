'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

export default function SessionGraph({ data }: { data: { date: string, profit: number }[] }) {
    if (!data || data.length === 0) return null

    // Calculate cumulative profit
    let cumulative = 0;
    const chartData = data.map(item => {
        cumulative += Number(item.profit)
        return {
            date: item.date,
            profit: item.profit,
            cumulative: cumulative
        }
    })

    return (
        <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis
                        dataKey="date"
                        stroke="#71717a"
                        fontSize={10}
                        tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}`
                        }}
                    />
                    <YAxis stroke="#71717a" fontSize={10} tickFormatter={(value) => `${value}€`} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '12px', fontSize: '12px' }}
                        itemStyle={{ color: '#10b981' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                        formatter={(value: any) => [`${value > 0 ? '+' : ''}${value}€`, 'Net Profit']}
                        labelFormatter={(label) => new Date(label).toLocaleDateString()}
                    />
                    <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
                    <Line
                        type="monotone"
                        dataKey="cumulative"
                        stroke="#10b981"
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2, fill: '#000' }}
                        activeDot={{ r: 6, strokeWidth: 2, fill: '#10b981' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}
