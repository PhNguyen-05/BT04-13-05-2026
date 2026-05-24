const Order = require('../models/Order');

const DEFAULT_AUTO_CONFIRM_INTERVAL_MS = 60 * 1000;

const autoConfirmDueOrders = async () => {
    const now = new Date();

    return Order.updateMany(
        {
            status: 'pending',
            autoConfirmAt: { $lte: now },
        },
        {
            $set: {
                status: 'confirmed',
                confirmedAt: now,
            },
            $push: {
                statusHistory: {
                    status: 'confirmed',
                    note: 'Tu dong xac nhan sau 30 phut',
                    changedAt: now,
                },
            },
        }
    );
};

const startOrderAutoConfirmJob = () => {
    const intervalMs = Math.max(
        10 * 1000,
        Number(process.env.ORDER_AUTO_CONFIRM_INTERVAL_MS) || DEFAULT_AUTO_CONFIRM_INTERVAL_MS
    );
    let running = false;

    const run = async () => {
        if (running) return;
        running = true;

        try {
            const result = await autoConfirmDueOrders();
            const changed = result.modifiedCount || result.nModified || 0;
            if (changed > 0) {
                console.log(`[Aura Lips] Auto-confirmed ${changed} pending order(s).`);
            }
        } catch (error) {
            console.error('[Aura Lips] Auto-confirm orders failed:', error.message);
        } finally {
            running = false;
        }
    };

    const timer = setInterval(run, intervalMs);
    timer.unref?.();
    run();

    return timer;
};

module.exports = {
    autoConfirmDueOrders,
    startOrderAutoConfirmJob,
};
