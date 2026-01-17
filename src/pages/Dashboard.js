import { useEffect, useMemo, useState } from 'react'

const colors = [
  '#2563eb',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ef4444',
  '#14b8a6',
  '#8b5cf6',
  '#eab308',
  '#0ea5e9',
  '#ec4899',
]

const monthLabels = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

function parseCsv(text) {
  return text
    .split('\n')
    .slice(1) // skip header
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [nom_spectacle, date, quantite_tickets] = line.split(',')
      return {
        nom_spectacle,
        date,
        quantite_tickets: Number(quantite_tickets),
      }
    })
}

function BarChart({ data, title, valueLabel }) {
  const max = Math.max(...data.map((d) => d.value), 1)
  return (
    <div className="card">
      <h3>{title}</h3>
      <div className="bar-chart">
        {data.map((d) => (
          <div key={d.label} className="bar-row">
            <span className="bar-label">{d.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
              />
            </div>
            <span className="bar-value">
              {d.value} {valueLabel}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PieChart({ data, title }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1

  let current = 0
  const gradients = data
    .map((d) => {
      const start = current
      const end = start + (d.value / total) * 100
      current = end
      return `${d.color} ${start.toFixed(2)}% ${end.toFixed(2)}%`
    })
    .join(', ')

  return (
    <div className="card pie-card">
      <h3>{title}</h3>
      <div className="pie-wrapper">
        <div className="pie" style={{ background: `conic-gradient(${gradients})` }} />
        <div className="pie-legend">
          {data.map((d) => (
            <div key={d.label} className="legend-row">
              <span className="legend-dot" style={{ backgroundColor: d.color }} />
              <span className="legend-label">{d.label}</span>
              <span className="legend-value">
                {Math.round((d.value / total) * 100)}% ({d.value})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL || ''}/assets/reservations.csv`)
        if (!res.ok) {
          throw new Error('Fichier CSV introuvable')
        }
        const text = await res.text()
        setRows(parseCsv(text))
      } catch (err) {
        console.error(err)
        setError('Impossible de charger le dataset')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalTickets = rows.reduce((sum, r) => sum + r.quantite_tickets, 0)

    const ticketsByShow = {}
    const ticketsByMonth = {}

    rows.forEach((r) => {
      ticketsByShow[r.nom_spectacle] = (ticketsByShow[r.nom_spectacle] || 0) + r.quantite_tickets

      const monthIdx = new Date(r.date).getMonth()
      ticketsByMonth[monthIdx] = (ticketsByMonth[monthIdx] || 0) + r.quantite_tickets
    })

    const barData = Object.entries(ticketsByShow)
      .map(([label, value], idx) => ({ label, value, color: colors[idx % colors.length] }))
      .sort((a, b) => b.value - a.value)

    const pieData = Object.entries(ticketsByShow).map(([label, value], idx) => ({
      label,
      value,
      color: colors[idx % colors.length],
    }))

    const monthData = Array.from({ length: 12 }, (_, i) => ({
      label: monthLabels[i],
      value: ticketsByMonth[i] || 0,
      color: '#2563eb',
    }))

    return {
      totalTickets,
      totalOrders: rows.length,
      spectaclesCount: barData.length,
      barData,
      pieData,
      monthData,
    }
  }, [rows])

  if (loading) return <div className="loading">Chargement du dashboard...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div className="dashboard-page">
      <h2>Dashboard Réservations</h2>

      <div className="kpi-grid">
        <div className="card kpi">
          <p className="kpi-label">Tickets vendus</p>
          <p className="kpi-value">{stats.totalTickets}</p>
        </div>
        <div className="card kpi">
          <p className="kpi-label">Commandes (lignes CSV)</p>
          <p className="kpi-value">{stats.totalOrders}</p>
        </div>
        <div className="card kpi">
          <p className="kpi-label">Spectacles suivis</p>
          <p className="kpi-value">{stats.spectaclesCount}</p>
        </div>
      </div>

      <div className="charts-grid">
        <BarChart title="Tickets par spectacle" data={stats.barData} valueLabel="tickets" />
        <PieChart title="Répartition par spectacle" data={stats.pieData} />
        <BarChart title="Tickets par mois" data={stats.monthData} valueLabel="tickets" />
      </div>
    </div>
  )
}

export default Dashboard
