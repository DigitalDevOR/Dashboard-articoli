import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '../../hooks/useAuth';
import Header from '../../components/layout/Header';
import BottomNavigation from '../../components/layout/BottomNavigation';
import CodiceInvito from '../../components/ui/codiceInvito';
import { useGetUserSocialDataQuery } from '../../store/api/userApi';

export default function ProfilePage() {
  const { data: userData, isLoading: userLoading } = useGetUserSocialDataQuery();
    useEffect(() => {
        console.log("User Data:", userData);
    }
    , [userData]);
  const [, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  
  // Mostro l'interfaccia anche se non c'è utente - è meglio avere una UI visibile
  // che un errore o uno schermo vuoto in caso di problemi di autenticazione

  type menuItemsType = {
    icon: string;
    label: string;
    path: string;
  };

  const menuItems: menuItemsType[] = [
    {
      icon: 'ri-trophy-line',
      label: 'Tornei in corso',
      path: '/tournaments',
    },
    /* {
      icon: 'ri-medal-line',
      label: 'Badge ottenuti',
      path: '/badges',
    } */
  ];

  return (
    <div className="page-container bg-neutral-50">
      <Header title="" showMenu={true} />

      <div className="p-4">
        <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {user?.profileImage ? (
                <div className="mr-3 overflow-hidden rounded-full w-14 h-14">
                  <img
                    src={user.profileImage}
                    alt={user.fullName}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center mr-3 text-white rounded-full w-14 h-14 bg-primary">
                  <i className="text-xl ri-user-line"></i>
                </div>
              )}
              <div>
                <span className="block text-lg font-semibold text-primary">
                  {user?.fullName || 'Utente'}
                </span>
                <span className="text-sm text-gray-500">
                  @{user?.username}
                </span>
              </div>
            </div>
            <button
              onClick={() => setLocation('/settings/profile')}
              className="text-sm text-primary"
            >
              <i className="mr-1 ri-edit-line"></i>
              Modifica
            </button>
          </div>
        </div>

        <div className="p-4 mb-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Saldo Crediti</span>
            <span className="text-lg font-semibold text-primary">
              {user?.credits || 0}
            </span>
          </div>
          {/*<button
            onClick={() => setLocation('/buy-credits')}
            className="w-full px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary"
          >
            Acquista Crediti
          </button>*/}
        </div>

        <div className="space-y-3">
          {menuItems.filter(Boolean).map((item, index) => (
            <a
              key={index}
              href="#"
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                setLocation(item.path);
              }}
            >
              <div className="flex items-center">
                <i className={`${item.icon} text-lg text-primary mr-3`}></i>
                <span className="font-medium text-primary">{item.label}</span>
              </div>
              <i className="text-gray-400 ri-arrow-right-s-line"></i>
            </a>
          ))}
          <CodiceInvito inviteCode={userData?.inviteCode} invitedPeople={userData?.invitedPeople} />
        </div>
      </div>

      <BottomNavigation activeItem="profile" />
    </div>
  );
}
