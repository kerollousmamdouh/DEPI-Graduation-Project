import { useEffect, useContext } from "react"; // 1. أضفنا useContext هنا
import { useLocation } from "react-router-dom";
import Logo from "./logoUI";
import SearchBar from "./searchUI";
import HeaderIcons from "./icon";
import LanguageToggle from "./LanguageToggle";
import { SiteContext } from "../../Store/SiteContext"; // 2. استدعاء السايت كونتكست

const Navbar = ({ query, setQuery, onTriggerScroll, wishListCount, cartCount, lang, setLang }) => {
  const location = useLocation();
  
  // داخل ملف Navbar.jsx الصواب هو:
const { currentUser } = useContext(SiteContext); 
const isLoggedIn = !!currentUser; // هتبقى true لو الحساب موجود
  useEffect(() => {
    const handleFormSubmit = (e) => {
      if (location.pathname.includes("offers")) {
        e.preventDefault();
        e.stopPropagation();
        if (onTriggerScroll) onTriggerScroll();
      }
    };
    const searchForm = document.querySelector("header form");
    if (searchForm) searchForm.addEventListener("submit", handleFormSubmit);
    return () => { if (searchForm) searchForm.removeEventListener("submit", handleFormSubmit); };
  }, [location.pathname, onTriggerScroll]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-2 px-3 sm:px-4 shadow-xs">
      <div className="container mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4">
        
        <div className="flex items-center justify-between w-full sm:w-auto">
          <Logo />
          
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle lang={lang} setLang={setLang} />
            {/* 4. تمرير الـ isLoggedIn الديناميكية للموبايل */}
            <HeaderIcons isLoggedIn={isLoggedIn} wishListCount={wishListCount} cartCount={cartCount} />
          </div>
        </div>

        <div className="w-full sm:grow sm:max-w-xl sm:mx-4">
          <SearchBar query={query} setQuery={setQuery} onTriggerScroll={onTriggerScroll} lang={lang} />
        </div>

        <div className="hidden sm:flex items-center gap-3">
          <LanguageToggle lang={lang} setLang={setLang} />
          {/* 5. تمرير الـ isLoggedIn الديناميكية للديسكتوب */}
          <HeaderIcons isLoggedIn={isLoggedIn} wishListCount={wishListCount} cartCount={cartCount} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;