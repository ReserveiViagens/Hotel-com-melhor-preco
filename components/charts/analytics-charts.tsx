import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

interface ChartData {
  name: string
  value: number
  [key: string]: any
}

interface AnalyticsChartsProps {
  data: {
    overview: any
    trends: ChartData[]
    demographics: any
    bookings: any
    marketing: any
    realTime: any
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export function RevenueChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => 
            new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(value)
          }
        />
        <Legend />
        <Area 
          type="monotone" 
          dataKey="revenue" 
          stackId="1" 
          stroke="#8884d8" 
          fill="#8884d8" 
          fillOpacity={0.6}
        />
        <Area 
          type="monotone" 
          dataKey="bookings" 
          stackId="1" 
          stroke="#82ca9d" 
          fill="#82ca9d" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function BookingsChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="bookings" fill="#8884d8" />
        <Bar dataKey="revenue" fill="#82ca9d" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DemographicsChart({ data }: { data: any }) {
  const ageData = data.ageGroups.map((group: any) => ({
    name: group.range,
    value: group.count,
    percentage: group.percentage
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={ageData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {ageData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function MarketingChart({ data }: { data: any }) {
  const campaignData = data.campaigns.map((campaign: any) => ({
    name: campaign.name,
    impressions: campaign.impressions,
    clicks: campaign.clicks,
    conversions: campaign.conversions,
    cost: campaign.cost,
    roi: campaign.roi
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={campaignData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="conversions" fill="#8884d8" />
        <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

export function RealTimeChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="activeUsers" 
          stroke="#8884d8" 
          strokeWidth={2}
          dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="bookings" 
          stroke="#82ca9d" 
          strokeWidth={2}
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function DeviceChart({ data }: { data: any }) {
  const deviceData = data.devices.map((device: any) => ({
    name: device.type,
    value: device.count,
    percentage: device.percentage
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={deviceData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) => `${name}: ${percentage}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {deviceData.map((entry: any, index: number) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function TrafficSourceChart({ data }: { data: any }) {
  const sourceData = data.sources.map((source: any) => ({
    name: source.source,
    value: source.count,
    percentage: source.percentage
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={sourceData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={100} />
        <Tooltip />
        <Legend />
        <Bar dataKey="value" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function SatisfactionChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 5]} />
        <Tooltip />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="satisfaction" 
          stroke="#82ca9d" 
          strokeWidth={3}
          dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function ConversionChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="sessions" fill="#8884d8" />
        <Line yAxisId="right" type="monotone" dataKey="conversionRate" stroke="#ff7300" />
      </ComposedChart>
    </ResponsiveContainer>
  )
} 