// src/utils/auditLogger.js

export const auditLogger = {
    logView(user, title, description, module, action) {
        const logEntry = {
        userId: user?.id || "unknown",
        userName: user?.name || "unknown",
        role: user?.role || "unknown",
        title,
        description,
        module,
        action,
        timestamp: new Date().toISOString(),
        };

        console.log("AUDIT LOG:", logEntry);

        // Optional: store locally
        const existingLogs = JSON.parse(localStorage.getItem("auditLogs") || "[]");
        existingLogs.push(logEntry);
        localStorage.setItem("auditLogs", JSON.stringify(existingLogs));
    },
    };
export default auditLogger;