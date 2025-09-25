import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '📊'
    },
    {
      name: 'Transactions',
      href: '/transactions',
      icon: '💳'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: '📈'
    },
    {
      name: 'Receipt Upload',
      href: '/receipt-upload',
      icon: '📄'
    }
  ];

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />
      <SidebarContainer isOpen={isOpen}>
        <SidebarHeader>
          <Logo>Finance App</Logo>
        </SidebarHeader>
        
        <NavList>
          {navigation.map((item) => (
            <NavItem key={item.name}>
              <NavLink
                to={item.href}
                isActive={location.pathname === item.href}
                onClick={onClose}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </NavItem>
          ))}
        </NavList>

        <UserSection>
          <UserInfo>
            <UserName>{user?.username}</UserName>
            <UserEmail>{user?.email}</UserEmail>
          </UserInfo>
          <LogoutButton onClick={handleLogout}>
            Sign Out
          </LogoutButton>
        </UserSection>
      </SidebarContainer>
    </>
  );
}

const SidebarContainer = styled.aside`
  position: fixed;
  left: ${props => props.isOpen ? '0' : '-250px'};
  top: 0;
  width: 250px;
  height: 100vh;
  background: ${props => props.theme.colors.white};
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: left 0.3s ease;
  z-index: 1000;

  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    left: ${props => props.isOpen ? '0' : '-100%'};
  }
`;

const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.white};
`;

const Logo = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
`;

const NavList = styled.ul`
  list-style: none;
  padding: ${props => props.theme.spacing.md} 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  color: ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.text};
  background: ${props => props.isActive ? props.theme.colors.light : 'transparent'};
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: ${props => props.isActive ? `3px solid ${props.theme.colors.primary}` : '3px solid transparent'};

  &:hover {
    background: ${props => props.theme.colors.light};
    color: ${props => props.theme.colors.primary};
  }

  span {
    margin-left: ${props => props.theme.spacing.md};
    font-weight: 500;
  }
`;

const UserSection = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: ${props => props.theme.spacing.lg};
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.light};
`;

const UserInfo = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
`;

const UserName = styled.p`
  font-weight: 500;
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const UserEmail = styled.p`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.textMuted};
  margin: 0;
`;

const LogoutButton = styled.button`
  width: 100%;
  padding: ${props => props.theme.spacing.sm} ${props => props.theme.spacing.md};
  background: ${props => props.theme.colors.danger};
  color: ${props => props.theme.colors.white};
  border: none;
  border-radius: ${props => props.theme.borderRadius};
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #c82333;
  }
`;

const Overlay = styled.div`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (min-width: ${props => props.theme.breakpoints.tablet}) {
    display: none;
  }
`;

export default Sidebar;