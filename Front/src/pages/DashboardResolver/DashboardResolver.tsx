import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DashboardResolver(){
  const navigate = useNavigate();
  useEffect(() => {
    const last = localStorage.getItem('last_app_id');
    if (last) navigate(`/dashboard/${last}`, { replace: true });
    else navigate(`/dashboard/demo`, { replace: true });
  }, [navigate]);
  return null;
}
