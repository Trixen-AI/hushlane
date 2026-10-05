import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { ASSETS, fromBase } from '../lib/oneclick'
import { isActive, useRoutes, type Route } from '../lib/routes'
import { num, usd } from '../lib/prices'
import { PhasePill } from '../components/ui'
import { timeAgo } from '../components/time'

type Filter = 'all' | 'active' | 'done' | 'stopped'

const received = (r: Route) =>
  r.out.length && r.out.every((l) => l.status === 'SUCCESS')
    ? `${num(r.out.reduce((a, l) => a + fromBase(l.finalAmountOut ?? l.amountOut, ASSETS[l.to].decimals), 0), r.landAs === 'SOL' ? 4 : 2)} ${r.landAs}`
    : 'Pending'

export function RoutesList() {
  const all = useRoutes()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const list = all.filter((r) =>
    filter === 'all' ? true : filter === 'active' ? isActive(r) : filter === 'done' ? r.phase === 'completed' : ['refunded', 'failed', 'expired'].includes(r.phase),
  )

  return (
    <div className="panel">
      <div className="panel__head">
        <div className="seg seg--tabs" role="tablist" aria-label="Filter routes">
          {(
            [
              ['all', 'All'],
              ['active', 'Active'],
              ['done', 'Arrived'],
              ['stopped', 'Refunded / expired'],
            ] as [Filter, string][]
          ).map(([k, label]) => (
            <button key={k} type="button" role="tab" aria-selected={filter === k} className={filter === k ? 'is-on' : ''} onClick={() => setFilter(k)}>
              {label}
            </button>
          ))}
        </div>
        <Link to="/app/new" className="btn btn--solid btn--sm">
          New route
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <p className="empty__title">{all.length === 0 ? 'No routes yet' : 'Nothing here'}</p>
          <p className="panel__sub">Routes you start appear here. They are kept in this browser only; export them from Settings to keep a copy.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Started</th>
                <th>Send</th>
                <th>Wallets</th>
                <th>Land as</th>
                <th>Received</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => (
                <tr
                  key={r.id}
                  className="is-link"
                  tabIndex={0}
                  onClick={() => navigate(`/app/routes/${r.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/routes/${r.id}`)}
                >
                  <td>{timeAgo(r.createdAt)}</td>
                  <td>
                    {r.in.amountInFormatted} {r.source} <span className="faint">{usd(Number(r.in.amountInUsd || 0))}</span>
                  </td>
                  <td>{r.outputs.length}</td>
                  <td>{r.landAs}</td>
                  <td>{received(r)}</td>
                  <td>
                    <PhasePill phase={r.phase} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
