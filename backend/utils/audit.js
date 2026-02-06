    const pool = require("../db");

    function getIp(req) {
    const xf = req.headers["x-forwarded-for"];
    if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
    return req.ip || req.connection?.remoteAddress || null;
    }

    /**
     * Log an audit event.
     * @param {object} req Express request (should have req.user from verifyToken)
     * @param {object} event {action, resource, resourceId, details, module, severity}
     */
    async function logAudit(req, event) {
    try {
        const user = req.user || {};
        const ip = getIp(req);

        const payload = {
        user_id: user.id ?? null,
        user_name: user.name ?? null,
        user_role: user.role ?? null,
        action: event.action,
        resource: event.resource ?? null,
        resource_id: event.resourceId ?? null,
        details: event.details ?? null,
        module: event.module ?? null,
        severity: event.severity ?? "info",
        ip_address: ip,
        };

        await pool.query(
        `INSERT INTO audit_trail
            (user_id, user_name, user_role, action, resource, resource_id, details, module, severity, ip_address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            payload.user_id,
            payload.user_name,
            payload.user_role,
            payload.action,
            payload.resource,
            payload.resource_id,
            payload.details,
            payload.module,
            payload.severity,
            payload.ip_address,
        ]
        );
    } catch (err) {
        // Never break the main request because of audit logging
        console.error("audit log error:", err.message);
    }
    }

    module.exports = { logAudit };
