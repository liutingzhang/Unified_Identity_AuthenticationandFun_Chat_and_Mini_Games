import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaHandSparkles, FaBell, FaSearch } from 'react-icons/fa';

// --- Styled Components ---

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 40px;
  height: 80px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(111, 78, 55, 0.03);
  position: sticky;
  top: 0;
  z-index: 40;
  transition: all 0.3s ease;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

const WelcomeText = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 500;
  font-family: system-ui, -apple-system, sans-serif;
  letter-spacing: 0.5px;
`;

const WelcomeIcon = styled.div`
  font-size: 20px;
  color: var(--primary-color);
  background: rgba(111, 78, 55, 0.08);
  padding: 10px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;

  ${HeaderContainer}:hover & {
    transform: rotate(15deg);
  }
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const ActionButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-light);
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(111, 78, 55, 0.05);
    color: var(--primary-color);
    transform: translateY(-2px);
  }
`;

const LogoutButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color), #8d6e63);
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 14px;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(111, 78, 55, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover::before {
    left: 100%;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(111, 78, 55, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <HeaderContainer>
      <HeaderLeft>
        <WelcomeText>
          <WelcomeIcon>
            <FaHandSparkles />
          </WelcomeIcon>
          <span>欢迎您, {user ? user.name : 'Guest'}</span>
        </WelcomeText>
      </HeaderLeft>
      <HeaderRight>
        <ActionButton title="搜索">
          <FaSearch />
        </ActionButton>
        <ActionButton title="通知">
          <FaBell />
        </ActionButton>
        <LogoutButton onClick={logout}>
          <FaSignOutAlt />
          退出登录
        </LogoutButton>
      </HeaderRight>
    </HeaderContainer>
  );
};

export default Header;