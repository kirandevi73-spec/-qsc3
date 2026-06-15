/**
 * QSC3 — Security Hardening Routes
 * Mount at: /api/security
 *
 * HSM endpoints:   /api/security/hsm/*
 * Verify endpoints:/api/security/verify/*
 */

const { Router } = require('express');
const rateLimit = require('express-rate-limit');
const {
    initHSM, generateKey, signData, verifySignature,
    kemEncapsulate, listKeys, deleteKey, hsmStatus, SUPPORTED_ALGOS,
} = require('../services/hsm.js');
const {
    verifyStateMachine, verifyTrace, PRESET_MACHINES,
} = require('../services/formalVerification.js');

const router = Router();

// ── Rate limiting (tighter for crypto ops) ────────────────────────────────
const cryptoLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    message: { error: 'Too many cryptographic requests, slow down.' },
});

router.use(cryptoLimiter);

// ── HSM ────────────────────────────────────────────────────────────────────

// GET /api/security/hsm/status
router.get('/hsm/status', (_req, res) => {
    res.json({ ok: true, data: hsmStatus() });
});

// GET /api/security/hsm/algorithms
router.get('/hsm/algorithms', (_req, res) => {
    res.json({ ok: true, data: SUPPORTED_ALGOS });
});

// GET /api/security/hsm/keys
router.get('/hsm/keys', (_req, res) => {
    res.json({ ok: true, data: listKeys() });
});

// POST /api/security/hsm/keys
// Body: { label, algo, usage }
router.post('/hsm/keys', async (req, res, next) => {
    try {
        const { label, algo, usage = 'sign' } = req.body;
        if (!label || !algo) return res.status(400).json({ error: 'label and algo required' });

        const key = await generateKey(label, algo, usage);
        res.status(201).json({ ok: true, data: key });
    } catch (err) {
        next(err);
    }
});

// POST /api/security/hsm/sign
// Body: { label, data }
router.post('/hsm/sign', async (req, res, next) => {
    try {
        const { label, data } = req.body;
        if (!label || !data) return res.status(400).json({ error: 'label and data required' });

        const result = await signData(label, data);
        res.json({ ok: true, data: result });
    } catch (err) {
        next(err);
    }
});

// POST /api/security/hsm/verify
// Body: { label, data, signature }
router.post('/hsm/verify', async (req, res, next) => {
    try {
        const { label, data, signature } = req.body;
        if (!label || !data || !signature) {
            return res.status(400).json({ error: 'label, data, and signature required' });
        }
        const result = await verifySignature(label, data, signature);
        res.json({ ok: true, data: result });
    } catch (err) {
        next(err);
    }
});

// POST /api/security/hsm/kem
// Body: { label }
router.post('/hsm/kem', async (req, res, next) => {
    try {
        const { label } = req.body;
        if (!label) return res.status(400).json({ error: 'label required' });
        const result = await kemEncapsulate(label);
        res.json({ ok: true, data: result });
    } catch (err) {
        next(err);
    }
});

// DELETE /api/security/hsm/keys/:label
router.delete('/hsm/keys/:label', async (req, res, next) => {
    try {
        const result = await deleteKey(req.params.label);
        res.json({ ok: true, data: result });
    } catch (err) {
        next(err);
    }
});

// ── Formal Verification ───────────────────────────────────────────────────

// GET /api/security/verify/presets
router.get('/verify/presets', (_req, res) => {
    res.json({
        ok: true,
        data: Object.entries(PRESET_MACHINES).map(([key, m]) => ({
            key,
            id: m.id,
            states: m.states.length,
            transitions: m.transitions.length,
        })),
    });
});

// POST /api/security/verify/machine
// Body: { machine, options? }  — or  { preset: 'STANDARD_SHIPMENT', options? }
router.post('/verify/machine', async (req, res, next) => {
    try {
        let { machine, preset, options = {} } = req.body;

        if (preset) {
            machine = PRESET_MACHINES[preset];
            if (!machine) return res.status(400).json({ error: `Unknown preset: ${preset}` });
        }
        if (!machine) return res.status(400).json({ error: 'machine or preset required' });

        const result = await verifyStateMachine(machine, options);
        res.json({ ok: true, data: result });
    } catch (err) {
        next(err);
    }
});

// POST /api/security/verify/trace
// Body: { trace: string[] }
router.post('/verify/trace', (req, res) => {
    const { trace } = req.body;
    if (!Array.isArray(trace) || trace.length === 0) {
        return res.status(400).json({ error: 'trace must be a non-empty array of state strings' });
    }
    const result = verifyTrace(trace);
    res.json({ ok: true, data: result });
});

// POST /api/security/verify/run-all-presets
// Convenience: verify all built-in machines at once
router.post('/verify/run-all-presets', async (req, res, next) => {
    try {
        const results = await Promise.all(
            Object.values(PRESET_MACHINES).map(m => verifyStateMachine(m))
        );
        const allPassed = results.every(r => r.passed);
        res.json({ ok: true, allPassed, data: results });
    } catch (err) {
        next(err);
    }
});

module.exports = router;