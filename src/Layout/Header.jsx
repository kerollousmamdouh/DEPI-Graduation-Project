import Links from "../Components/HeaderUI/Links";
import Navbar from '../Components/HeaderUI/Navbar';

function Header({
  query,
  setQuery,
  onTriggerScroll,
  wishListCount,
  cartCount,
  lang,      // 🌟 استقبلنا lang هنا
  setLang,   // 🌟 استقبلنا setLang هنا
}) {
  return (
    <>
      <div className="w-full bg-white border-b shadow-xs">
        {/* نمرر lang و setLang إلى الـ Navbar */}
        <Navbar
          query={query}
          setQuery={setQuery}
          onTriggerScroll={onTriggerScroll}
          wishListCount={wishListCount}
          cartCount={cartCount}
          lang={lang}
          setLang={setLang}
        />

        <div className="relative bg-white">
          {/* نمرر lang إلى Navbar1 إذا كان يحتوي على نصوص تتبدل */}
          <Links lang={lang} />
        </div>
      </div>
    </>
  );
}

export default Header;