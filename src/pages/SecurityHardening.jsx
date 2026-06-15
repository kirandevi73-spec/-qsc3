/**
 * QSC3 — Security Hardening Dashboard
 * HSM/YubiKey management + Formal Verification UI
 */

import { memo, useState, useCallback, useEffect, useRef } from 'react';

const API = 'http://localhost:5000/api/security';

// ── Design tokens ─────────────────────────────────────────────────────────
const COLORS = {
    bg: '#0a0c0f',
    surface: '#111418',
    border: '#1e2530',
    borderHi: '#2d3d52',
    text: '#c8d4e0',
    textDim: '#556070',
    textBright: '#e8f0fa',
    green: '#00e87a',
    red: '#ff3b5c',
    amber: '#ffb820',
    cyan: '#00c8ff',
    purple: '#a855f7',
    blueDim: '#1a2535',
};

const ALGO_COLORS = {
    KYBER_768: COLORS.cyan,
    DILITHIUM_3: COLORS.green,
    FALCON_512: COLORS.purple,
    SPHINCS_SHA2: COLORS.amber,
    ECDSA_P256: COLORS.textDim,
    RSA_4096: COLORS.textDim,
};

// ── Tiny helpers ──────────────────────────────────────────────────────────
const Badge = memo(({ label, color, small }) => (
    <span style={{
        padding: small ? '2px 7px' : '3px 10px',
        borderRadius: 3,
        fontSize: small ? 10 : 11,
        fontFamily: 'monospace',
        fontWeight: 700,
        letterSpacing: '0.05em',
        color: '#000',
        background: color,
        whiteSpace: 'nowrap',
    }}>
        {label}
    </span>
));

const Pill = memo(({ ok }) => (
    <span style={{
        width: 8, height: 8, borderRadius: '50%',
        display: 'inline-block',
        background: ok ? COLORS.green : COLORS.red,
        boxShadow: `0 0 6px ${ok ? COLORS.green : COLORS.red}88`,
        flexShrink: 0,
    }} />
));

const Section = memo(({ title, accent, children }) => (
    <div style={{
        background: COLORS.surface,
        border: `1px solid ${COLORS.border}`,
        borderTop: `2px solid ${accent || COLORS.cyan}`,
        borderRadius: 6,
        padding: '20px 24px',
        marginBottom: 20,
    }}>
        <h3 style={{
            margin: '0 0 18px',
            fontSize: 12,
            fontFamily: 'monospace',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: accent || COLORS.cyan,
        }}>
            {title}
        </h3>
        {children}
    </div>
));

const MonoRow = memo(({ label, value, valueColor }) => (
    <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 0',
        borderBottom: `1px solid ${COLORS.border}`,
        fontSize: 12, fontFamily: 'monospace',
    }}>
        <span style={{ color: COLORS.textDim }}>{label}</span>
        <span style={{ color: valueColor || COLORS.textBright, fontWeight: 600 }}>{String(value)}</span>
    </div>
));

const Btn = memo(({ onClick, children, accent, disabled, small }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={{
            padding: small ? '5px 14px' : '8px 18px',
            background: disabled ? COLORS.border : 'transparent',
            border: `1px solid ${disabled ? COLORS.border : (accent || COLORS.cyan)}`,
            color: disabled ? COLORS.textDim : (accent || COLORS.cyan),
            borderRadius: 4,
            fontSize: 11,
            fontFamily: 'monospace',
            letterSpacing: '0.08em',
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
        }}
    >
        {children}
    </button>
));

// ── HSM Status Panel ──────────────────────────────────────────────────────
const HSMStatus = memo(({ status }) => {
    if (!status) return null;
    return (
        <Section title="◈ HSM ATTESTATION" accent={COLORS.cyan}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
                <MonoRow label="MODE" value={status.mode?.toUpperCase()} valueColor={status.fipsMode ? COLORS.green : COLORS.amber} />
                <MonoRow label="LABEL" value={status.label} />
                <MonoRow label="SLOT" value={status.slot} />
                <MonoRow label="KEYS LOADED" value={status.keysLoaded} valueColor={COLORS.cyan} />
                <MonoRow label="PQC READY" value={status.pqcReady ? 'YES' : 'NO'} valueColor={status.pqcReady ? COLORS.green : COLORS.red} />
                <MonoRow label="FIPS MODE" value={status.fipsMode ? 'YES' : 'NO'} valueColor={status.fipsMode ? COLORS.green : COLORS.amber} />
                <MonoRow label="UPTIME" value={`${Math.round(status.uptime)}s`} />
            </div>
            <div style={{ marginTop: 14 }}>
                <p style={{ fontSize: 11, fontFamily: 'monospace', color: COLORS.textDim, margin: 0 }}>
                    ALGORITHMS SUPPORTED:
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {status.algorithms?.map(a => (
                        <Badge key={a} label={a} color={ALGO_COLORS[a] || COLORS.textDim} small />
                    ))}
                </div>
            </div>
        </Section>
    );
});

// ── Key Management Panel ──────────────────────────────────────────────────
const ALGOS = ['KYBER_768', 'DILITHIUM_3', 'FALCON_512', 'SPHINCS_SHA2', 'ECDSA_P256', 'RSA_4096'];

const KeyManagement = memo(({ keys, onGenerate, onDelete, loading }) => {
    const [label, setLabel] = useState('');
    const [algo, setAlgo] = useState('DILITHIUM_3');
    const [usage, setUsage] = useState('sign');

    const inputStyle = {
        background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4,
        color: COLORS.text, fontSize: 12, fontFamily: 'monospace', padding: '6px 10px',
        outline: 'none', width: '100%', boxSizing: 'border-box',
    };
    const selectStyle = { ...inputStyle, width: 'auto', minWidth: 140 };

    return (
        <Section title="🗝 KEY STORE" accent={COLORS.purple}>
            {/* Generate form */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <input
                    style={{ ...inputStyle, flex: 1, minWidth: 140 }}
                    placeholder="key-label"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                />
                <select style={selectStyle} value={algo} onChange={e => setAlgo(e.target.value)}>
                    {ALGOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select style={{ ...selectStyle, minWidth: 90 }} value={usage} onChange={e => setUsage(e.target.value)}>
                    <option value="sign">sign</option>
                    <option value="kem">kem</option>
                    <option value="both">both</option>
                </select>
                <Btn
                    onClick={() => { onGenerate(label, algo, usage); setLabel(''); }}
                    disabled={!label || loading}
                    accent={COLORS.green}
                >
                    + GENERATE
                </Btn>
            </div>

            {/* Key list */}
            {keys.length === 0 ? (
                <p style={{ color: COLORS.textDim, fontSize: 12, fontFamily: 'monospace', margin: 0 }}>
                    No keys in store. Generate one above.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {keys.map(k => (
                        <div key={k.keyId} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px',
                            background: COLORS.blueDim,
                            border: `1px solid ${COLORS.border}`,
                            borderRadius: 4,
                            fontSize: 12, fontFamily: 'monospace',
                        }}>
                            <Pill ok />
                            <span style={{ color: COLORS.textBright, flex: 1 }}>{k.label}</span>
                            <Badge label={k.algo} color={ALGO_COLORS[k.algo] || COLORS.textDim} small />
                            {k.pqc && <Badge label="PQC" color={COLORS.green} small />}
                            <span style={{ color: COLORS.textDim, fontSize: 10 }}>
                                L{k.secLevel} · {k.keyId.slice(0, 8)}
                            </span>
                            <Btn small accent={COLORS.red} onClick={() => onDelete(k.label)}>✕</Btn>
                        </div>
                    ))}
                </div>
            )}
        </Section>
    );
});

// ── Sign / Verify Panel ────────────────────────────────────────────────────
const CryptoOps = memo(({ keys }) => {
    const [mode, setMode] = useState('sign');
    const [keyLabel, setKeyLabel] = useState('');
    const [data, setData] = useState('');
    const [signature, setSignature] = useState('');
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);

    const areaStyle = {
        background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4,
        color: COLORS.text, fontSize: 11, fontFamily: 'monospace', padding: '8px 10px',
        resize: 'vertical', width: '100%', boxSizing: 'border-box', outline: 'none',
    };
    const selectStyle = {
        background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4,
        color: COLORS.text, fontSize: 12, fontFamily: 'monospace', padding: '6px 10px',
        outline: 'none',
    };

    const run = useCallback(async () => {
        if (!keyLabel || !data) return;
        setBusy(true); setResult(null);
        try {
            if (mode === 'sign') {
                const r = await fetch(`${API}/hsm/sign`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ label: keyLabel, data }),
                }).then(x => x.json());
                setResult(r);
                if (r.ok) setSignature(r.data.signature);
            } else {
                const r = await fetch(`${API}/hsm/verify`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ label: keyLabel, data, signature }),
                }).then(x => x.json());
                setResult(r);
            }
        } catch (e) {
            setResult({ ok: false, error: e.message });
        }
        setBusy(false);
    }, [mode, keyLabel, data, signature]);

    return (
        <Section title="✦ CRYPTO OPS" accent={COLORS.amber}>
            <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                <select style={selectStyle} value={mode} onChange={e => { setMode(e.target.value); setResult(null); }}>
                    <option value="sign">Sign</option>
                    <option value="verify">Verify</option>
                </select>
                <select style={selectStyle} value={keyLabel} onChange={e => setKeyLabel(e.target.value)}>
                    <option value="">-- select key --</option>
                    {keys.filter(k => k.usage !== 'kem').map(k => (
                        <option key={k.keyId} value={k.label}>{k.label} ({k.algo})</option>
                    ))}
                </select>
                <Btn onClick={run} disabled={busy || !keyLabel || !data} accent={COLORS.amber}>
                    {busy ? '…' : mode === 'sign' ? 'SIGN' : 'VERIFY'}
                </Btn>
            </div>

            <textarea
                style={{ ...areaStyle, minHeight: 60 }}
                placeholder="Data / message to sign or verify…"
                value={data}
                onChange={e => setData(e.target.value)}
            />

            {mode === 'verify' && (
                <textarea
                    style={{ ...areaStyle, minHeight: 60, marginTop: 8 }}
                    placeholder="Paste signature (base64)…"
                    value={signature}
                    onChange={e => setSignature(e.target.value)}
                />
            )}

            {result && (
                <div style={{
                    marginTop: 12, padding: '10px 14px',
                    background: result.ok ? '#001a0f' : '#1a0008',
                    border: `1px solid ${result.ok ? COLORS.green : COLORS.red}`,
                    borderRadius: 4,
                    fontSize: 11, fontFamily: 'monospace',
                    wordBreak: 'break-all',
                }}>
                    {result.ok ? (
                        mode === 'sign' ? (
                            <>
                                <span style={{ color: COLORS.green }}>✓ SIGNED</span>
                                <span style={{ color: COLORS.textDim }}> · {result.data.algo} · {result.data.keyId.slice(0, 8)}</span>
                                <div style={{ color: COLORS.textDim, marginTop: 6, fontSize: 10 }}>
                                    {result.data.signature.slice(0, 80)}…
                                </div>
                            </>
                        ) : (
                            <span style={{ color: result.data.valid ? COLORS.green : COLORS.red }}>
                                {result.data.valid ? '✓ SIGNATURE VALID' : '✗ SIGNATURE INVALID'}
                                <span style={{ color: COLORS.textDim }}> · {result.data.algo}</span>
                            </span>
                        )
                    ) : (
                        <span style={{ color: COLORS.red }}>✗ {result.error}</span>
                    )}
                </div>
            )}
        </Section>
    );
});

// ── Formal Verification Panel ─────────────────────────────────────────────
const PRESETS = ['STANDARD_SHIPMENT', 'PQC_KEY_LIFECYCLE'];

const FormalVerify = memo(() => {
    const [preset, setPreset] = useState('STANDARD_SHIPMENT');
    const [result, setResult] = useState(null);
    const [busy, setBusy] = useState(false);
    const [trace, setTrace] = useState('');
    const [traceResult, setTraceResult] = useState(null);

    const runMachine = useCallback(async () => {
        setBusy(true); setResult(null);
        try {
            const r = await fetch(`${API}/verify/machine`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ preset }),
            }).then(x => x.json());
            setResult(r);
        } catch (e) {
            setResult({ ok: false, error: e.message });
        }
        setBusy(false);
    }, [preset]);

    const runTrace = useCallback(async () => {
        if (!trace.trim()) return;
        const traceArr = trace.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
        try {
            const r = await fetch(`${API}/verify/trace`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trace: traceArr }),
            }).then(x => x.json());
            setTraceResult(r);
        } catch (e) {
            setTraceResult({ ok: false, error: e.message });
        }
    }, [trace]);

    const selectStyle = {
        background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 4,
        color: COLORS.text, fontSize: 12, fontFamily: 'monospace', padding: '6px 10px',
        outline: 'none',
    };

    const d = result?.data;

    return (
        <Section title="⬡ FORMAL VERIFICATION" accent={COLORS.green}>
            {/* Machine checker */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                <select style={selectStyle} value={preset} onChange={e => setPreset(e.target.value)}>
                    {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <Btn onClick={runMachine} disabled={busy} accent={COLORS.green}>
                    {busy ? 'VERIFYING…' : 'RUN VERIFICATION'}
                </Btn>
            </div>

            {d && (
                <div style={{ marginBottom: 20 }}>
                    {/* Summary bar */}
                    <div style={{
                        display: 'flex', gap: 16, flexWrap: 'wrap',
                        padding: '10px 14px', marginBottom: 14,
                        background: d.passed ? '#001a0f' : '#1a0008',
                        border: `1px solid ${d.passed ? COLORS.green : COLORS.red}`,
                        borderRadius: 4,
                        fontSize: 12, fontFamily: 'monospace',
                    }}>
                        <span style={{ color: d.passed ? COLORS.green : COLORS.red, fontWeight: 700 }}>
                            {d.passed ? '✓ PASS' : '✗ FAIL'}
                        </span>
                        <span style={{ color: COLORS.textDim }}>ID: {d.verificationId}</span>
                        <span style={{ color: COLORS.textDim }}>{d.durationMs}ms</span>
                        <span style={{ color: COLORS.cyan }}>
                            {d.summary.reachableStates}/{d.summary.totalStates} reachable
                        </span>
                        <span style={{ color: COLORS.textDim }}>
                            {d.summary.tracesExplored} traces
                        </span>
                    </div>

                    {/* Invariants */}
                    <p style={{ fontSize: 11, color: COLORS.textDim, fontFamily: 'monospace', margin: '0 0 8px' }}>
                        INVARIANTS:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {d.invariants.map(inv => (
                            <div key={inv.id} style={{
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                                padding: '8px 12px',
                                background: COLORS.bg,
                                border: `1px solid ${inv.passed ? COLORS.border : COLORS.red}`,
                                borderRadius: 4,
                                fontSize: 11, fontFamily: 'monospace',
                            }}>
                                <Pill ok={inv.passed} />
                                <div>
                                    <div style={{ color: inv.passed ? COLORS.text : COLORS.red, fontWeight: 600 }}>
                                        {inv.id}
                                    </div>
                                    <div style={{ color: COLORS.textDim, marginTop: 2, fontSize: 10 }}>
                                        {inv.description}
                                        {!inv.passed && <span style={{ color: COLORS.red }}> · {inv.violations} violation(s)</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Metrics */}
                    <div style={{
                        display: 'flex', gap: 24, flexWrap: 'wrap',
                        marginTop: 14, padding: '10px 0',
                        borderTop: `1px solid ${COLORS.border}`,
                        fontSize: 11, fontFamily: 'monospace', color: COLORS.textDim,
                    }}>
                        <span>States: <strong style={{ color: COLORS.text }}>{d.metrics.states}</strong></span>
                        <span>Transitions: <strong style={{ color: COLORS.text }}>{d.metrics.transitions}</strong></span>
                        <span>Cyclomatic: <strong style={{ color: COLORS.text }}>{d.metrics.cyclomaticComplexity}</strong></span>
                        <span>Dead-ends: <strong style={{ color: d.reachability.deadEnds.length > 0 ? COLORS.red : COLORS.green }}>
                            {d.reachability.deadEnds.length}
                        </strong></span>
                        {d.reachability.unreachable.length > 0 && (
                            <span style={{ color: COLORS.amber }}>
                                Unreachable: {d.reachability.unreachable.join(', ')}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Trace checker */}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                <p style={{ fontSize: 11, color: COLORS.textDim, fontFamily: 'monospace', margin: '0 0 8px' }}>
                    QUICK TRACE CHECK (comma-separated states):
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                    <input
                        style={{
                            flex: 1, background: COLORS.bg, border: `1px solid ${COLORS.border}`,
                            borderRadius: 4, color: COLORS.text, fontSize: 11, fontFamily: 'monospace',
                            padding: '6px 10px', outline: 'none',
                        }}
                        placeholder="CREATED, IN_TRANSIT, INSPECTED, DELIVERED"
                        value={trace}
                        onChange={e => setTrace(e.target.value)}
                    />
                    <Btn onClick={runTrace} disabled={!trace.trim()} accent={COLORS.cyan} small>
                        CHECK
                    </Btn>
                </div>
                {traceResult && (
                    <div style={{
                        marginTop: 8, padding: '8px 12px',
                        background: traceResult.data?.passed ? '#001a0f' : '#1a0008',
                        border: `1px solid ${traceResult.data?.passed ? COLORS.green : COLORS.red}`,
                        borderRadius: 4,
                        fontSize: 11, fontFamily: 'monospace',
                    }}>
                        {traceResult.ok ? (
                            <>
                                <span style={{ color: traceResult.data.passed ? COLORS.green : COLORS.red }}>
                                    {traceResult.data.passed ? '✓ TRACE VALID' : '✗ INVARIANT VIOLATIONS'}
                                </span>
                                {!traceResult.data.passed && (
                                    <div style={{ marginTop: 6, color: COLORS.textDim, fontSize: 10 }}>
                                        {traceResult.data.checks
                                            .filter(c => !c.passed)
                                            .map(c => <div key={c.id}>• {c.id}: {c.description}</div>)
                                        }
                                    </div>
                                )}
                            </>
                        ) : (
                            <span style={{ color: COLORS.red }}>✗ {traceResult.error}</span>
                        )}
                    </div>
                )}
            </div>
        </Section>
    );
});

// ── Main Page ──────────────────────────────────────────────────────────────
export default memo(function SecurityHardening() {
    const [status, setStatus] = useState(null);
    const [keys, setKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initErr, setInitErr] = useState(null);

    const loadStatus = useCallback(async () => {
        try {
            const [s, k] = await Promise.all([
                fetch(`${API}/hsm/status`).then(r => r.json()),
                fetch(`${API}/hsm/keys`).then(r => r.json()),
            ]);
            if (s.ok) setStatus(s.data);
            if (k.ok) setKeys(k.data);
            setInitErr(null);
        } catch (e) {
            setInitErr(e.message);
        }
    }, []);

    useEffect(() => { loadStatus(); }, [loadStatus]);

    const handleGenerate = useCallback(async (label, algo, usage) => {
        if (!label) return;
        setLoading(true);
        try {
            const r = await fetch(`${API}/hsm/keys`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ label, algo, usage }),
            }).then(x => x.json());
            if (r.ok) setKeys(prev => [...prev, r.data]);
        } catch { }
        setLoading(false);
    }, []);

    const handleDelete = useCallback(async (label) => {
        try {
            const r = await fetch(`${API}/hsm/keys/${encodeURIComponent(label)}`, {
                method: 'DELETE',
            }).then(x => x.json());
            if (r.ok) setKeys(prev => prev.filter(k => k.label !== label));
        } catch { }
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: COLORS.bg,
            color: COLORS.text,
            fontFamily: "'IBM Plex Mono', 'Courier New', monospace",
            padding: '24px 28px',
            maxWidth: 900,
            margin: '0 auto',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                marginBottom: 28,
                paddingBottom: 18,
                borderBottom: `1px solid ${COLORS.border}`,
            }}>
                <div>
                    <div style={{
                        fontSize: 10, letterSpacing: '0.2em', color: COLORS.textDim,
                        fontFamily: 'monospace', marginBottom: 6,
                    }}>
                        QSC3 · PHASE 4 · SECURITY HARDENING
                    </div>
                    <h1 style={{
                        margin: 0, fontSize: 22,
                        fontWeight: 700, letterSpacing: '-0.01em',
                        color: COLORS.textBright,
                    }}>
                        HSM / YubiKey + Formal Verification
                    </h1>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {initErr ? (
                        <Badge label="BACKEND OFFLINE" color={COLORS.red} />
                    ) : (
                        <Badge label="SECURE" color={COLORS.green} />
                    )}
                    <Btn onClick={loadStatus} accent={COLORS.cyan} small>↻ REFRESH</Btn>
                </div>
            </div>

            {initErr && (
                <div style={{
                    padding: '10px 16px', marginBottom: 20,
                    background: '#1a0008', border: `1px solid ${COLORS.red}`,
                    borderRadius: 4, fontSize: 12, fontFamily: 'monospace', color: COLORS.red,
                }}>
                    ⚠ Cannot reach backend at {API} — {initErr}
                    <br />
                    <span style={{ color: COLORS.textDim }}>
                        Start backend: <code>cd backend && node server.js</code>
                    </span>
                </div>
            )}

            <HSMStatus status={status} />
            <KeyManagement keys={keys} onGenerate={handleGenerate} onDelete={handleDelete} loading={loading} />
            <CryptoOps keys={keys} />
            <FormalVerify />
        </div>
    );
});