import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';

function Header({ onToggleSidebar }) {
  
  const { user } = useAuth();

  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <MenuButton onClick={onToggleSidebar}>
          ☰
        </MenuButton>
        <Title>Personal Finance Assistant</Title>
      </div>
      
      <UserInfo>
        <WelcomeText>Welcome back,</WelcomeText>
        <UserName>{user?.username}</UserName>
      </UserInfo>
    </HeaderContainer>
  );
}


const HeaderContainer = styled.header`
  background: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.spacing.md} ${props => props.theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: ${props => props.theme.spacing.sm};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.borderRadius};

  &:hover {
    background: ${props => props.theme.colors.light};
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  color: ${props => props.theme.colors.text};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    font-size: 1.25rem;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.spacing.md};

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    display: none;
  }
`;

const WelcomeText = styled.span`
  color: ${props => props.theme.colors.textMuted};
  font-size: 0.875rem;
`;

const UserName = styled.span`
  font-weight: 500;
  color: ${props => props.theme.colors.text};
`;

export default Header;