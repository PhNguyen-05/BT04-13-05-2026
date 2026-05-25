const numberFormatter = new Intl.NumberFormat('vi-VN', {
    maximumFractionDigits: 0,
});

export const formatNumber = (value) => numberFormatter.format(Number(value || 0));

export const formatCurrency = (value) => `${formatNumber(value)} đ`;
