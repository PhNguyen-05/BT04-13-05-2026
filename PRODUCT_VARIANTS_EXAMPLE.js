// Ví dụ cấu trúc sản phẩm với variants (màu sắc)
// Sử dụng trong seed.js hoặc API POST /products

const sampleProduct = {
    name: "Son Môi Dưỡng Lâu Trôi",
    description: "Son môi cao cấp Aura Lips — màu chuẩn, bền màu, dưỡng môi.",
    price: 180000,
    originalPrice: 220000,
    category: "ObjectId của category",
    stock: 500,
    sold: 0,
    isFeatured: true,
    
    // Hình ảnh mặc định (chung cho tất cả variants)
    images: [
        "/product/main-01.jpg",
        "/product/main-02.jpg"
    ],
    
    // Danh sách màu sắc (chuỗi)
    colors: ["Red", "Pink", "Nude"],
    
    // Variants - mỗi màu có hình ảnh riêng và tồn kho riêng
    variants: [
        {
            color: "Red",
            colorName: "Đỏ Tươi",
            images: [
                "/product/red-01.jpg",
                "/product/red-02.jpg",
                "/product/red-03.jpg"
            ],
            stock: 150,
            sku: "SKU-RED-001"
        },
        {
            color: "Pink",
            colorName: "Hồng Pastel",
            images: [
                "/product/pink-01.jpg",
                "/product/pink-02.jpg",
                "/product/pink-03.jpg"
            ],
            stock: 200,
            sku: "SKU-PINK-001"
        },
        {
            color: "Nude",
            colorName: "Nude Tự Nhiên",
            images: [
                "/product/nude-01.jpg",
                "/product/nude-02.jpg",
                "/product/nude-03.jpg"
            ],
            stock: 150,
            sku: "SKU-NUDE-001"
        }
    ]
};

/**
 * HƯỚNG DẪN SỬ DỤNG:
 * 
 * 1. THÊM VARIANTS CHO SẢN PHẨM HIỆN CÓ:
 *    - Mỗi variant cần có: color, colorName, images, stock, sku
 *    - images: Mảng URL hình ảnh cho màu đó (sẽ hiển thị trong swiper)
 *    - stock: Tồn kho cho màu cụ thể đó
 *    - Người dùng chọn màu → Hình ảnh swiper sẽ cập nhật theo variant
 * 
 * 2. GIAO DIỆN NGƯỜI DÙNG:
 *    - Nút chọn màu được hiển thị dưới giá: "Hồng Pastel (02)", "Đỏ Tươi (01)", ...
 *    - Khi chọn màu:
 *      • Swiper hình ảnh cập nhật theo hình của variant đó
 *      • Stock cập nhật theo stock của variant
 *      • Số lượng reset về 1
 *    - Nút "−" "+" giới hạn theo stock của variant được chọn
 * 
 * 3. GIỎ HÀNG:
 *    - Mỗi sản phẩm với màu khác nhau là item riêng biệt
 *    - Ví dụ: Thêm "Son Môi" màu Đỏ × 2 → Thêm "Son Môi" màu Hồng × 1
 *    - = 2 item trong giỏ (không gộp lại)
 *    - Hiển thị: "Biến thể: Hồng Pastel" bên cạnh tên sản phẩm
 * 
 * 4. CẠP NHẬT DỮ LIỆU:
 *    - Nếu sản phẩm không có variants → Hiển thị hình ảnh mặc định
 *    - Nếu có variants → Hiển thị nút chọn màu + hình theo variant
 */

export default sampleProduct;
