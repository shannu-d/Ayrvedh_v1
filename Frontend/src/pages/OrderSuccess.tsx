import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const OrderSuccess = () => {
  const { t } = useTranslation();
  return (
    <div className="container-main py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
        <CheckCircle className="h-20 w-20 text-brand-olive mx-auto" />
      </motion.div>
      <h1 className="font-serif text-3xl font-bold mt-8">{t("orderConfirmed")}</h1>
      <p className="text-muted-foreground mt-3 max-w-md mx-auto">
        {t("orderConfirmedDesc")}
      </p>
      <div className="flex gap-3 justify-center mt-8">
        <Link to="/profile" className="bg-foreground text-background px-6 py-3 rounded-sm text-sm font-medium hover:opacity-90 transition-opacity">
          {t("viewOrders")}
        </Link>
        <Link to="/products" className="border border-border px-6 py-3 rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
          {t("continueShopping")}
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;
