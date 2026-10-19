import { useState, useEffect } from "react";
import useDashboard from "../Hooks/useDashboard";
import { useDashboardState } from "../Hooks/useDashboardState";
import { useLanguage } from "../context/LanguageContext";
import { apiClient } from "../services/apiClient";
import { Globe } from "lucide-react";
import { toast } from "sonner";

import DashboardContainer from "../components/dashboard/layout/DashboardContainer";
import DashboardHeader from "../components/dashboard/components/DashboardHeader";

import StoreOverviewSection from "../components/dashboard/sections/StoreOverviewSection";
import StoreHealthSection from "../components/dashboard/sections/StoreHealthSection";
import OrdersOverviewSection from "../components/dashboard/sections/OrdersOverviewSection";
import InventorySection from "../components/dashboard/sections/InventorySection";
import EngagementSection from "../components/dashboard/sections/EngagementSection";

export default function Dashboard() {
    const dashboard = useDashboard();
    const { lang } = useLanguage();

    const {
        isLoading,
        hasError,
        isEmpty,
    } = useDashboardState(dashboard);

    const [isMultiLanguage, setIsMultiLanguage] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(false);

    useEffect(() => {
        const fetchStoreSettings = async () => {
            try {
                const res = await apiClient.get("/settings");
                if (res && typeof res === "object") {
                    const mlSetting = res.isMultiLanguage || res.multi_language;
                    if (mlSetting) {
                        setIsMultiLanguage(String(mlSetting.value).toLowerCase() === "true" || mlSetting.value === "1");
                    }
                }
            } catch (err) {
                console.warn("Failed to fetch store settings:", err);
            }
        };
        fetchStoreSettings();
    }, []);

    const handleToggleMultiLanguage = async () => {
        const newValue = !isMultiLanguage;
        setLoadingSettings(true);
        try {
            await apiClient.put("/settings", {
                key_name: "isMultiLanguage",
                key_value: String(newValue),
            });
            setIsMultiLanguage(newValue);
            toast.success(newValue ? "Multi-language enabled on storefront" : "Multi-language disabled on storefront");
        } catch (err) {
            toast.error("Failed to update language setting");
        } finally {
            setLoadingSettings(false);
        }
    };

    return (
        <DashboardContainer>

            <DashboardHeader />

            {/* Storefront Language Toggle */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Globe className="text-green-600" size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-800">
                                {lang === "ar" ? "ترجمة الصفحة الرئيسية" : "Homepage Language Toggle"}
                            </h3>
                            <p className="text-[11px] text-gray-400 mt-0.5">
                                {isMultiLanguage
                                    ? (lang === "ar" ? "المفعّل - يظهر زر اللغة في الواجهة" : "Enabled - Language button shown on storefront")
                                    : (lang === "ar" ? "معطّل - لا يظهر زر اللغة" : "Disabled - Language button hidden on storefront")}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleToggleMultiLanguage}
                        disabled={loadingSettings}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500/50 cursor-pointer ${
                            isMultiLanguage ? "bg-green-600" : "bg-gray-300"
                        } ${loadingSettings ? "opacity-60" : ""}`}
                    >
                        <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                                isMultiLanguage ? "translate-x-6.5" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>
            </div>

            <StoreOverviewSection
                data={dashboard.overview}
            />

            <StoreHealthSection
                data={dashboard.health}
            />

            <OrdersOverviewSection
                data={dashboard.orders}
            />

            <InventorySection
                data={dashboard.inventory}
            />

            <EngagementSection
                data={dashboard.engagement}
            />

        </DashboardContainer>
    );
}
