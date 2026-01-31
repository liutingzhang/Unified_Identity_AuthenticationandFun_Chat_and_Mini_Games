import React, { useState, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const Container = styled.div`
  padding: 32px;
  max-width: 1280px;
  margin: 0 auto;
  background: var(--bg-surface);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(24px) saturate(120%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent);
  }
`;

const Header = styled.h1`
  color: var(--text-primary);
  margin-bottom: 30px;
  font-size: 32px;
  font-family: 'Ma Shan Zheng', cursive;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const RoleSelection = styled.div`
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: rgba(255,255,255,0.4);
  padding: 20px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.5);
`;

const RoleLabel = styled.label`
  font-weight: 600;
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 0;
`;

const RoleSelect = styled.select`
  padding: 12px 18px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  min-width: 240px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:focus {
    background: #fff;
    box-shadow: 0 4px 12px rgba(111, 78, 55, 0.1);
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover-color));
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s var(--ease-spring);
  box-shadow: 
    0 8px 16px -4px rgba(111, 78, 55, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  font-weight: 600;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 22px -4px rgba(111, 78, 55, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.4);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const UserList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const UserCard = styled.div`
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background-color: ${props => props.checked ? 'rgba(111, 78, 55, 0.08)' : 'rgba(255, 255, 255, 0.6)'};
  transition: all 0.3s var(--ease-spring);
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
  cursor: pointer;
  
  &:hover {
    box-shadow: 0 12px 24px -4px rgba(111, 78, 55, 0.15);
    transform: translateY(-4px);
    border-color: var(--primary-color);
    background-color: ${props => props.checked ? 'rgba(111, 78, 55, 0.12)' : 'white'};
  }

  /* 选中时的装饰边框 */
  ${props => props.checked && `
    border-color: var(--primary-color);
    box-shadow: 0 8px 20px -4px rgba(111, 78, 55, 0.2);
  `}
`;

const UserName = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-size: 16px;
`;

const UserInfo = styled.div`
  font-size: 13px;
  color: var(--text-light);
`;

const Status = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: ${props => props.checked ? '#2e7d32' : '#c62828'};
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
  }
`;

const Summary = styled.div`
  background-color: rgba(111, 78, 55, 0.04);
  padding: 20px 24px;
  border-radius: 16px;
  margin-bottom: 30px;
  border: 1px solid rgba(111, 78, 55, 0.1);
  color: var(--text-secondary);
  font-size: 15px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);
`;

const RollCallPage = () => {
  const { users, roles } = useData();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [checkedUsers, setCheckedUsers] = useState(new Set());
  const [isChecking, setIsChecking] = useState(false);

  // 获取所选角色的用户
  const filteredUsers = useMemo(() => {
    if (!selectedRoleId) return [];
    return users.filter(user => user.userType === selectedRoleId);
  }, [users, selectedRoleId]);

  // 开始点名
  const startRollCall = useCallback(() => {
    if (!selectedRoleId) {
      alert('请先选择角色');
      return;
    }
    setCheckedUsers(new Set());
    setIsChecking(true);
  }, [selectedRoleId]);

  // 结束点名
  const endRollCall = useCallback(() => {
    setIsChecking(false);
  }, []);

  // 标记用户为已到
  const checkUser = useCallback((userId) => {
    if (!isChecking) return;
    
    setCheckedUsers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  }, [isChecking]);

  // 全选
  const checkAll = useCallback(() => {
    if (!isChecking) return;
    
    setCheckedUsers(new Set(filteredUsers.map(user => user.id)));
  }, [isChecking, filteredUsers]);

  // 清空选择
  const clearAll = useCallback(() => {
    if (!isChecking) return;
    
    setCheckedUsers(new Set());
  }, [isChecking]);

  const totalUsers = filteredUsers.length;
  const presentUsers = checkedUsers.size;
  const absentUsers = totalUsers - presentUsers;

  return (
    <Container>
      <Header>📋 点名系统</Header>
      
      <RoleSelection>
        <RoleLabel htmlFor="role-select">选择角色：</RoleLabel>
        <RoleSelect 
          id="role-select"
          value={selectedRoleId} 
          onChange={(e) => setSelectedRoleId(e.target.value)}
          disabled={isChecking}
        >
          <option value="">请选择角色</option>
          {roles.filter(role => role.name !== '超级管理员').map(role => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </RoleSelect>
      </RoleSelection>

      {selectedRoleId && (
        <Summary>
          <div>所选角色: {selectedRoleId}</div>
          <div>总人数: {totalUsers}</div>
          <div>已到人数: {presentUsers}</div>
          <div>缺席人数: {absentUsers}</div>
          <div>出勤率: {totalUsers > 0 ? ((presentUsers / totalUsers) * 100).toFixed(1) : 0}%</div>
        </Summary>
      )}

      <Controls>
        <Button 
          onClick={startRollCall}
          disabled={isChecking || !selectedRoleId}
        >
          开始点名
        </Button>
        <Button 
          onClick={endRollCall}
          disabled={!isChecking}
        >
          结束点名
        </Button>
        <Button 
          onClick={checkAll}
          disabled={!isChecking || filteredUsers.length === 0}
        >
          全选
        </Button>
        <Button 
          onClick={clearAll}
          disabled={!isChecking}
        >
          清空
        </Button>
      </Controls>

      {selectedRoleId && filteredUsers.length > 0 && (
        <UserList>
          {filteredUsers.map(user => (
            <UserCard 
              key={user.id}
              checked={checkedUsers.has(user.id)}
              onClick={() => checkUser(user.id)}
              style={{ cursor: isChecking ? 'pointer' : 'default' }}
            >
              <UserName>{user.name}</UserName>
              <UserInfo>ID: {user.id}</UserInfo>
              <UserInfo>用户类型: {user.userType || '无'}</UserInfo>
              <Status>
                {checkedUsers.has(user.id) ? '✅ 已到' : '❌ 缺席'}
              </Status>
            </UserCard>
          ))}
        </UserList>
      )}

      {selectedRoleId && filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          该角色下暂无用户
        </div>
      )}
    </Container>
  );
};

export default RollCallPage;
