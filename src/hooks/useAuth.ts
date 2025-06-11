import { useState, useEffect } from 'react';
import { AdminUser, UserRole } from '../types/Patient';

const mockRoles: UserRole[] = [
  {
    id: 'superadmin',
    nom: 'Super Administrateur',
    permissions: ['*']
  },
  {
    id: 'admin_technique',
    nom: 'Administrateur Technique',
    permissions: ['read_all', 'update_config', 'manage_patients']
  },
  {
    id: 'auditeur',
    nom: 'Auditeur',
    permissions: ['read_logs', 'read_patients']
  },
  {
    id: 'medecin_cabinet',
    nom: 'Médecin de Cabinet',
    permissions: ['manage_patients', 'manage_consultations', 'manage_factures']
  }
];

const mockUsers: AdminUser[] = [
  {
    id: '1',
    username: 'admin',
    role: mockRoles[0],
    type: 'hospitalier'
  },
  {
    id: '2', 
    username: 'tech',
    role: mockRoles[1],
    type: 'hospitalier'
  },
  {
    id: '3',
    username: 'audit',
    role: mockRoles[2],
    type: 'hospitalier'
  },
  {
    id: '4',
    username: 'medecin',
    role: mockRoles[3],
    type: 'cabinet',
    specialite: 'Médecine générale',
    numeroOrdre: '12345'
  }
];

export const useAuth = () => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('medrecap_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.username === username);
    if (foundUser && password === 'medrecap2025') {
      const userWithLogin = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };
      setUser(userWithLogin);
      localStorage.setItem('medrecap_user', JSON.stringify(userWithLogin));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medrecap_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.role.permissions.includes('*') || user.role.permissions.includes(permission);
  };

  return {
    user,
    isLoading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user
  };
};