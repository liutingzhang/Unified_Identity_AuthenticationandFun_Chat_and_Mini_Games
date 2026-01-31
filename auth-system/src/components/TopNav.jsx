import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import './TopNav.css';
import { useAuth } from '../context/AuthContext';
import { 
  FaChartPie, 
  FaUserFriends, 
  FaFileUpload, 
  FaUserTag, 
  FaCogs, 
  FaClipboardList, 
  FaShieldAlt, 
  FaUserCircle, 
  FaVoteYea, 
  FaDice, 
  FaListAlt,
  FaChevronDown
} from 'react-icons/fa';

// 标准菜单项
export const menuItems = [
  { path: '/', name: '仪表盘', icon: <FaChartPie />, requiredRole: '超级管理员' },
  {
    group: '系统管理', items: [
      { path: '/users', name: '用户管理', icon: <FaUserFriends />, requiredPermission: 'user:manage' },
      { path: '/users/import', name: '批量导入', icon: <FaFileUpload />, requiredPermission: 'user:manage' },
      { path: '/roles', name: '角色管理', icon: <FaUserTag />, requiredPermission: 'role:list' },
      { path: '/system', name: '系统设置', icon: <FaCogs />, requiredPermission: 'system:list' },
      { path: '/logs', name: '系统日志', icon: <FaClipboardList />, requiredPermission: 'log:list' },
      { path: '/permissions', name: '权限管理', icon: <FaShieldAlt />, requiredPermission: 'permission:edit' },
    ]
  },
  {
    group: '功能模块', items: [
      { path: '/profile', name: '个人资料', icon: <FaUserCircle />, requiredPermission: 'user:manage' }, // Using permission to hide if needed or just show
      { path: '/vote-system', name: '投票系统', icon: <FaVoteYea />, requiredPermission: 'vote:participate' },
      { path: '/random-draw', name: '随机抽奖', icon: <FaDice />, requiredPermission: 'random:draw' },
      { path: '/roll-call', name: '点名系统', icon: <FaListAlt />, requiredPermission: 'roll:call' },
    ]
  },
];

const TopNav = () => {
  const { hasPermission, user } = useAuth();
  const [activeGroup, setActiveGroup] = useState(null);
  const [mouseInDropdown, setMouseInDropdown] = useState(false);

  // 过滤菜单项基于用户权限
  const filteredMenuItems = menuItems.map(item => {
    if (item.group) {
      const filteredGroupItems = item.items.filter(subItem => {
         if (subItem.requiredRole && user?.role !== subItem.requiredRole) return false;
         if (subItem.path === '/profile') return true; 
         return hasPermission(subItem.requiredPermission);
      });
      if (filteredGroupItems.length > 0) {
        return { ...item, items: filteredGroupItems };
      }
      return null;
    } else {
      if (item.requiredRole && user?.role !== item.requiredRole) return null;
      if (!item.requiredPermission) return item;
      return hasPermission(item.requiredPermission) ? item : null;
    }
  }).filter(Boolean);

  return (
    <nav className="top-nav fade-in-up">
      <div className="nav-brand">
        <div className="brand-icon-container">
          <img src="/system-logo.png" alt="系统logo" className="brand-icon" />
        </div>
        <span className="brand-text text-glow">认证系统</span>
      </div>
      
      <div className="nav-menu">
        {filteredMenuItems.map((item, index) => (
          item.group ? (
              <div 
                key={index} 
                className="nav-group-container"
                onMouseEnter={() => setActiveGroup(item.group)}
                onMouseLeave={() => {
                  if (!mouseInDropdown) {
                    setActiveGroup(null);
                  }
                }}
              >
              <button className="nav-group-trigger float">
                <span className="nav-icon">{item.items[0]?.icon}</span>
                {item.group}
                <span className="dropdown-arrow"><FaChevronDown style={{ fontSize: '0.8em' }} /></span>
              </button>
              
              {activeGroup === item.group && (
                <div 
                  className="nav-dropdown"
                  onMouseEnter={() => setMouseInDropdown(true)}
                  onMouseLeave={() => {
                    setMouseInDropdown(false);
                    setActiveGroup(null);
                  }}
                >
                  {item.items.map(subItem => (
                    <NavLink
                      to={subItem.path}
                      key={subItem.path}
                      className={({ isActive }) => "nav-dropdown-item" + (isActive ? " active" : "")}
                      onClick={() => setActiveGroup(null)}
                    >
                      <span className="nav-icon gentle-shake">{subItem.icon}</span>
                      {subItem.name}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to={item.path}
              key={item.path}
              className={({ isActive }) => "nav-item float" + (isActive ? " active" : "")}
            >
              <span className="nav-icon gentle-shake">{item.icon}</span>
              {item.name}
            </NavLink>
          )
        ))}
      </div>
      
      <div className="nav-xusong">
        <div className="xusong-badge text-glow">
          <span className="xusong-kanji">系</span>
          <span className="xusong-title">管理系统</span>
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
