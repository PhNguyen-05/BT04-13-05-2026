import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="aura-footer">
            <Container>
                <Row className="gy-4">
                    <Col lg={4} md={6}>
                        <div className="aura-footer-brand d-flex align-items-center gap-2">
                            <span className="aura-brand-icon">
                                <i className="bi bi-heart-fill" />
                            </span>
                            Aura Lips
                        </div>
                        <p className="mb-3">
                            Thương hiệu son môi dịu dàng — tôn vinh vẻ đẹp tự nhiên của đôi môi bạn
                            với sắc pastel quyến rũ và chất lượng cao cấp.
                        </p>
                        <div>
                            <a href="#" className="aura-social-link" aria-label="Instagram">
                                <i className="bi bi-instagram" />
                            </a>
                            <a href="#" className="aura-social-link" aria-label="Facebook">
                                <i className="bi bi-facebook" />
                            </a>
                            <a href="#" className="aura-social-link" aria-label="TikTok">
                                <i className="bi bi-tiktok" />
                            </a>
                        </div>
                    </Col>

                    <Col lg={2} md={6} sm={6}>
                        <h5>Khám phá</h5>
                        <p><Link to="/">Trang chủ</Link></p>
                        <p><Link to="/shop">Cửa hàng</Link></p>
                        <p><Link to="/shop?onSale=true">Khuyến mãi</Link></p>
                        <p><Link to="/news">Tin & bài viết</Link></p>
                        <p><Link to="/register">Đăng ký thành viên</Link></p>
                    </Col>

                    <Col lg={3} md={6} sm={6}>
                        <h5>Liên hệ</h5>
                        <p>
                            <i className="bi bi-geo-alt me-2 text-aura" />
                            123 Nguyễn Huệ, Quận 1, TP.HCM
                        </p>
                        <p>
                            <i className="bi bi-telephone me-2 text-aura" />
                            090 861 7108
                        </p>
                        <p>
                            <i className="bi bi-envelope-heart me-2 text-aura" />
                            hello@auralips.vn
                        </p>
                    </Col>

                    <Col lg={3} md={6}>
                        <h5>Giờ mở cửa</h5>
                        <p>Thứ 2 – Thứ 6: 9:00 – 21:00</p>
                        <p>Thứ 7 – CN: 10:00 – 20:00</p>
                        <p className="mt-3 mb-0 small">
                            © {new Date().getFullYear()} Aura Lips. Made with{' '}
                            <i className="bi bi-heart-fill text-aura" /> in Vietnam.
                        </p>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;
