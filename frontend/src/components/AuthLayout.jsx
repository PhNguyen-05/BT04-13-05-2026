import { Row, Col } from 'react-bootstrap';

const AuthLayout = ({
    children,
    logoIcon,
    title,
    subtitle,
    image,
    imageAlt,
    imageKey,
    visualBadge,
    visualTitle,
    visualSubtitle,
    reverse = false,
    visualChildren,
}) => {
    const formSide = (
        <Col lg={5} className={`aura-auth-form-side ${reverse ? 'order-lg-2' : ''}`}>
            <div className="aura-auth-blob aura-auth-blob-1" />
            <div className="aura-auth-blob aura-auth-blob-2" />

            <div className="aura-auth-card animate-fade-in-up">
                <div className="aura-auth-logo animate-float">
                    <i className={`bi ${logoIcon}`} />
                </div>

                <h2 className="text-center font-display mb-1">{title}</h2>
                <p className="text-center text-muted mb-4">{subtitle}</p>

                {children}
            </div>
        </Col>
    );

    const visualSide = image ? (
        <Col lg={7} className={`d-none d-lg-block p-0 ${reverse ? 'order-lg-1' : ''}`}>
            <div className="aura-auth-visual">
                <img src={image} alt={imageAlt} key={imageKey} />
                <div className="aura-auth-visual-overlay" />
                {(visualBadge || visualTitle || visualSubtitle) && (
                    <div className="aura-auth-visual-content animate-fade-in-up delay-2">
                        {visualBadge && <span className="aura-hero-badge">{visualBadge}</span>}
                        {visualTitle && <h2 className="font-display">{visualTitle}</h2>}
                        {visualSubtitle && (
                            <p className="lead mb-0" style={{ color: 'var(--text-soft)' }}>
                                {visualSubtitle}
                            </p>
                        )}
                    </div>
                )}
                {visualChildren}
            </div>
        </Col>
    ) : null;

    return (
        <div className="aura-auth-page">
            <Row className="g-0 min-vh-100">
                {reverse ? (
                    <>
                        {visualSide}
                        {formSide}
                    </>
                ) : (
                    <>
                        {formSide}
                        {visualSide}
                    </>
                )}
            </Row>
        </div>
    );
};

export default AuthLayout;
