import { useRef, useState } from 'react'
import { HOLD_OPTIONS, routes, routeStore, type Route } from '../lib/routes'
import { settingsStore, useStore, walletStore, type SavedWallet } from '../lib/store'

export function Settings() {
  const s = useStore(settingsStore, (x) => x)
  const [msg, setMsg] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const exportData = () => {
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), routes: routeStore.get().items, wallets: walletStore.get().items }, null, 2)], {
      type: 'application/json',
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `hushlane-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text()) as { routes?: Route[]; wallets?: SavedWallet[] }
      if (!Array.isArray(data.routes) && !Array.isArray(data.wallets)) throw new Error('No routes or wallets in this file.')
      const known = new Set(routeStore.get().items.map((r) => r.id))
      routes.replaceAll([...routeStore.get().items, ...(data.routes ?? []).filter((r) => r?.id && !known.has(r.id))])
      const addrs = new Set(walletStore.get().items.map((w) => w.address))
      walletStore.set((w) => ({ items: [...w.items, ...(data.wallets ?? []).filter((x) => x?.address && !addrs.has(x.address))] }))
      setMsg('Imported.')
    } catch (e) {
      setMsg(`Import failed: ${(e as Error).message}`)
    }
  }

  return (
    <div className="split">
      <div className="panel panel--strong">
        <h2 className="panel__title">Route defaults</h2>
        <div className="grid-2">
          <div className="field">
            <label className="label" htmlFor="def-hold">
              Time in shielded pool
            </label>
            <select id="def-hold" className="input" value={s.defaultHold} onChange={(e) => settingsStore.set((x) => ({ ...x, defaultHold: e.target.value }))}>
              {HOLD_OPTIONS.map((h) => (
                <option key={h.label}>{h.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <p className="label">Land as</p>
            <div className="seg" role="radiogroup" aria-label="Default landing asset">
              {(['SOL', 'USDC'] as const).map((a) => (
                <button key={a} type="button" role="radio" aria-checked={s.defaultLandAs === a} className={s.defaultLandAs === a ? 'is-on' : ''} onClick={() => settingsStore.set((x) => ({ ...x, defaultLandAs: a }))}>
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="field" style={{ maxWidth: 260 }}>
          <label className="label" htmlFor="slip">
            Slippage tolerance
          </label>
          <select id="slip" className="input" value={s.slippageBps} onChange={(e) => settingsStore.set((x) => ({ ...x, slippageBps: Number(e.target.value) }))}>
            {[50, 100, 200, 300].map((b) => (
              <option key={b} value={b}>
                {(b / 100).toFixed(1)}%
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="panel panel--paper">
        <h2 className="panel__title">Your data</h2>
        <p className="panel__sub">Routes and saved wallets live in this browser only. Export a backup before clearing site data or switching devices.</p>
        <div className="btn-row">
          <button type="button" className="btn" onClick={exportData}>
            Export backup
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
        </div>
        {msg && <p className="notice">{msg}</p>}
        <button
          type="button"
          className="btn btn--sm"
          style={{ alignSelf: 'flex-start' }}
          onClick={() => {
            if (confirm('Delete all routes and saved wallets from this browser? Swaps already running are not affected.')) {
              routes.replaceAll([])
              walletStore.set({ items: [] })
              setMsg('Cleared.')
            }
          }}
        >
          Clear all local data
        </button>

        <h2 className="panel__title" style={{ marginTop: 12 }}>
          Setup
        </h2>
        <dl className="kv">
          <div>
            <dt>Swap provider</dt>
            <dd>NEAR Intents 1Click</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
