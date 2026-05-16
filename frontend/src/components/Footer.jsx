import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-dark text-light py-5 mt-auto">
            <Container>
                <Row>
                    <Col md={4}>
                        <h5>🌸 Aura Lips</h5>
                        <p>Thương hiệu son môi cao cấp Việt Nam</p>
                    </Col>
                    <Col md={4}>
                        <h5>Liên hệ</h5>
                        <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
                        <p>📞 090.861.7108</p>
                        <p>✉️ contact@auralips.com</p>
                    </Col>
                    <Col md={4}>
                        <h5>Theo dõi chúng tôi</h5>
                        <p>Instagram | Facebook | TikTok</p>
                        <small>© 2026 Aura Lips. All rights reserved.</small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
};

export default Footer;