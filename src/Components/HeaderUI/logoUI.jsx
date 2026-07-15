import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { SiteContext } from '../../Store/SiteContext'; // تأكد من مسار الـ Context
import fallbackImage from '../../assets/images/logo1.png'; // الصورة الاحتياطية

const Logo = () => {
  // سحبنا اللوجو من الـ Context اللي الأدمن بيتحكم فيه
  const { adminData } = useContext(SiteContext);

  return (
    <Link to="/home" className="shrink-0 flex items-center">
      <img 
        src={adminData?.logo1 || fallbackImage} 
        alt="Dealora" 
        className="h-12 w-auto sm:h-16 md:h-20 lg:h-24 max-h-[85vh] object-contain transition-all duration-300" 
      />
    </Link>
  );
};

// أهم سطر: هو ده اللي بيحل مشكلة Fast Refresh
export default Logo;