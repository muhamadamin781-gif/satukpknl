const Security = {
    logActivity(action) {
        const logData = {
            time: new Date().toLocaleString('id-ID'),
            action: action,
            device: navigator.userAgent
        };
        console.warn("🛡️ Security Audit:", logData);
    }
};