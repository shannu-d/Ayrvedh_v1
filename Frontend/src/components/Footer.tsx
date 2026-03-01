import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border bg-secondary/30 mt-20">
      <div className="container-main py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-serif text-xl font-bold mb-4">Ayurvedh</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footerTagline")}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">{t("footerShop")}</h4>
            <div className="flex flex-col gap-2">
              <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("allProducts")}</Link>
              <Link to="/products?category=Electronics" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("electronics")}</Link>
              <Link to="/products?category=Fashion" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("fashion")}</Link>
              <Link to="/products?category=Accessories" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t("accessories")}</Link>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">{t("footerHelp")}</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">{t("shippingReturns")}</span>
              <span className="text-sm text-muted-foreground">{t("faq")}</span>
              <span className="text-sm text-muted-foreground">{t("contactUs")}</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-4">{t("footerFollowUs")}</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">{t("instagram")}</span>
              <span className="text-sm text-muted-foreground">{t("twitter")}</span>
              <span className="text-sm text-muted-foreground">{t("pinterest")}</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 text-center">
          <p className="text-xs text-muted-foreground">{t("footerCopyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
