import React from 'react';
import { NavLink } from 'react-router-dom';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaUserFriends, 
  FaUserTag, 
  FaCogs, 
  FaClipboardList, 
  FaShieldAlt, 
  FaUserCircle, 
  FaVoteYea, 
  FaDice, 
  FaListAlt,
  FaFileUpload,
  FaChevronRight
} from 'react-icons/fa';

// --- Styled Components ---

const SidebarContainer = styled.div`
  width: 260px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px) saturate(180%);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  height: 100vh;
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 4px 0 24px -4px rgba(111, 78, 55, 0.05);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease;
`;

const SidebarHeader = styled.div`
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(111, 78, 55, 0.08);
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
`;

const LogoText = styled.h3`
  margin: 0;
  color: var(--primary-color);
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 28px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(111, 78, 55, 0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    opacity: 0.3;
  }
`;

const NavContainer = styled.nav`
  flex-grow: 1;
  overflow-y: auto;
  padding: 24px 16px;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(111, 78, 55, 0.1);
    border-radius: 4px;
  }
`;

const NavGroup = styled.div`
  margin-bottom: 24px;
`;

const GroupTitle = styled.h4`
  padding: 0 16px;
  margin: 0 0 12px;
  color: var(--text-light);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  opacity: 0.7;
`;

const shine = keyframes`
  0% { left: -100%; }
  20% { left: 200%; }
  100% { left: 200%; }
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: var(--text-secondary);
  font-family: system-ui, -apple-system, sans-serif;
  text-decoration: none;
  margin-bottom: 8px;
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  font-size: 15px;

  &:hover {
    background-color: rgba(255, 255, 255, 0.6);
    color: var(--primary-color);
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(111, 78, 55, 0.05);
  }

  &.active {
    background: linear-gradient(135deg, var(--primary-color), #8d6e63);
    color: #ffffff;
    box-shadow: 
      0 8px 20px -6px rgba(111, 78, 55, 0.5),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
    transform: translateX(4px);
  }

  &.active svg {
    color: #fff;
  }

  /* Shine effect */
  &.active::before {
    content: '';
    position: absolute;
    top: 0;
    left: -50%;
    width: 50%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: skewX(-20deg);
    animation: ${shine} 4s infinite;
  }
`;

const IconWrapper = styled.span`
  margin-right: 14px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$isActive ? '#fff' : 'var(--text-light)'};
  transition: color 0.3s ease;
  
  ${StyledNavLink}:hover & {
    color: var(--primary-color);
  }
  
  ${StyledNavLink}.active & {
    color: #fff;
  }
`;

const ChevronWrapper = styled.span`
  margin-left: auto;
  font-size: 12px;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
  
  ${StyledNavLink}.active & {
    opacity: 1;
    transform: translateX(0);
  }
`;

// --- Menu Configuration ---

export const menuItems = [
  { path: '/', name: '首页', icon: <FaHome />, requiredRole: '超级管理员' },
  {
    group: '系统管理', items: [
      { path: '/users', name: '用户管理', icon: <FaUserFriends />, requiredPermission: 'user:manage' },
      { path: '/users/import', name: '批量导入', icon: <FaFileUpload />, requiredPermission: 'user:manage' },
      { path: '/roles', name: '角色管理', icon: <FaUserTag />, requiredPermission: 'role:list' },
      { path: '/system', name: '系统管理', icon: <FaCogs />, requiredPermission: 'system:list' },
      { path: '/logs', name: '系统日志', icon: <FaClipboardList />, requiredPermission: 'log:list' },
      { path: '/permissions', name: '权限管理', icon: <FaShieldAlt />, requiredPermission: 'permission:edit' },
    ]
  },
  {
    group: '用户功能', items: [
      { path: '/profile', name: '个人资料', icon: <FaUserCircle /> },
      { path: '/vote-system', name: '投票系统', icon: <FaVoteYea />, requiredPermission: 'vote:participate' },
      { path: '/random-draw', name: '随机抽取', icon: <FaDice />, requiredPermission: 'random:draw' },
      { path: '/roll-call', name: '点名系统', icon: <FaListAlt />, requiredPermission: 'roll:call' },
    ]
  },
];

const Sidebar = () => {
  const { hasPermission, user } = useAuth();

  const filteredMenuItems = menuItems.map(item => {
    if (item.group) {
      const filteredGroupItems = item.items.filter(subItem => {
        if (subItem.requiredRole && user?.role !== subItem.requiredRole) return false;
        return hasPermission(subItem.requiredPermission);
      });
      if (filteredGroupItems.length > 0) {
        return { ...item, items: filteredGroupItems };
      }
      return null;
    } else {
      if (item.requiredRole && user?.role !== item.requiredRole) return null;
      return hasPermission(item.requiredPermission) ? item : null;
    }
  }).filter(Boolean);

  return (
    <SidebarContainer>
      <SidebarHeader>
        <LogoText>认证系统</LogoText>
      </SidebarHeader>
      <NavContainer>
        {filteredMenuItems.map((item, index) => (
          item.group ? (
            <NavGroup key={index}>
              <GroupTitle>{item.group}</GroupTitle>
              {item.items.map(subItem => (
                <StyledNavLink
                  to={subItem.path}
                  key={subItem.path}
                >
                  {({ isActive }) => (
                    <>
                      <IconWrapper $isActive={isActive}>{subItem.icon}</IconWrapper>
                      {subItem.name}
                      <ChevronWrapper>
                        <FaChevronRight />
                      </ChevronWrapper>
                    </>
                  )}
                </StyledNavLink>
              ))}
            </NavGroup>
          ) : (
            <StyledNavLink
              to={item.path}
              key={item.path}
            >
              {({ isActive }) => (
                <>
                  <IconWrapper $isActive={isActive}>{item.icon}</IconWrapper>
                  {item.name}
                  <ChevronWrapper>
                    <FaChevronRight />
                  </ChevronWrapper>
                </>
              )}
            </StyledNavLink>
          )
        ))}
      </NavContainer>
    </SidebarContainer>
  );
};

export default Sidebar;

