import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const Container = styled.div`
  padding: 32px;
  background: var(--bg-surface);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  backdrop-filter: blur(24px) saturate(120%);
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;

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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(111, 78, 55, 0.1);
`;

const Title = styled.h2`
  margin: 0;
  font-size: 32px;
  color: var(--text-primary);
  font-family: 'Ma Shan Zheng', cursive;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  
  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 24px;
    background: var(--primary-color);
    margin-right: 16px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(111, 78, 55, 0.3);
  }
`;

const Content = styled.div`
  display: flex;
  gap: 40px;
`;

const ControlPanel = styled.div`
  flex: 1;
  max-width: 320px;
  background: rgba(255, 255, 255, 0.4);
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.6);
`;

const ResultPanel = styled.div`
  flex: 2;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:focus {
    background: #fff;
    box-shadow: 0 4px 12px rgba(111, 78, 55, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
  
  &:focus {
    background: #fff;
    box-shadow: 0 4px 12px rgba(111, 78, 55, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover-color));
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s var(--ease-spring);
  box-shadow: 
    0 8px 20px -4px rgba(111, 78, 55, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  font-weight: 600;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 12px 28px -4px rgba(111, 78, 55, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.4);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const ResultContainer = styled.div`
  border: 1px solid rgba(111, 78, 55, 0.1);
  border-radius: var(--radius-lg);
  padding: 24px;
  min-height: 240px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: inset 0 2px 6px rgba(0,0,0,0.02);
`;

const ResultTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 20px;
  color: var(--text-primary);
  font-family: 'Ma Shan Zheng', cursive;
  border-bottom: 2px solid rgba(111, 78, 55, 0.08);
  padding-bottom: 10px;
`;

const UserList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const UserItem = styled.div`
  padding: 16px;
  background-color: white;
  border-radius: 12px;
  border: 1px solid rgba(111, 78, 55, 0.1);
  box-shadow: 0 4px 12px rgba(111, 78, 55, 0.05);
  display: flex;
  flex-direction: column;
  gap: 4px;
  transition: all 0.3s var(--ease-spring);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(111, 78, 55, 0.1);
    border-color: var(--primary-color);
  }
`;

const UserInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.span`
  font-weight: 500;
  color: var(--text-primary);
`;

const UserRole = styled.span`
  color: var(--text-light);
  font-size: 12px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  color: #909399;
  font-style: italic;
  padding: 40px 0;
`;

const RandomDrawPage = () => {
  const { users, roles } = useData();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [drawCount, setDrawCount] = useState(1);
  const [result, setResult] = useState([]);

  // 使用 useMemo 优化计算，避免不必要的重新计算
  const filteredRoles = useMemo(() => 
    roles.filter(role => role.name !== '超级管理员'), 
    [roles]
  );

  // 当前选中的角色对象（处理ID类型匹配）
  const selectedRole = useMemo(() => 
    roles.find(role => role.id == selectedRoleId), // 使用 == 而不是 === 来处理类型转换
    [roles, selectedRoleId]
  );

  // 当前角色下的用户列表
  const availableUsers = useMemo(() => {
    if (!selectedRole) return [];
    return users.filter(user => user.userType === selectedRole.name);
  }, [users, selectedRole]);

  // 角色用户数量统计
  const roleUserCounts = useMemo(() => {
    const counts = {};
    roles.forEach(role => {
      counts[role.id] = users.filter(user => user.userType === role.name).length;
    });
    return counts;
  }, [users, roles]);

  const handleDraw = () => {
    if (!selectedRoleId || !drawCount) {
      alert('请选择角色和抽取人数');
      return;
    }

    if (drawCount > availableUsers.length) {
      alert(`选择的人数不能大于该角色下的用户总数（${availableUsers.length}）`);
      return;
    }

    // 随机抽取算法
    const shuffledUsers = [...availableUsers];
    for (let i = shuffledUsers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledUsers[i], shuffledUsers[j]] = [shuffledUsers[j], shuffledUsers[i]];
    }

    const selectedUsers = shuffledUsers.slice(0, drawCount);
    setResult(selectedUsers);
  };

  const handleRoleChange = (roleId) => {
    setSelectedRoleId(roleId);
    setResult([]); // 清空之前的结果
    
    // 重置抽取人数为1或可用用户数的最小值
    if (roleId) {
      const userCount = roleUserCounts[roleId] || 0;
      setDrawCount(Math.min(1, userCount));
    } else {
      setDrawCount(1);
    }
  };

  const handleCountChange = (count) => {
    const num = parseInt(count) || 1;
    const max = availableUsers.length;
    setDrawCount(Math.min(Math.max(num, 1), max));
  };

  return (
    <Container>
      <Header>
        <Title>随机抽取</Title>
      </Header>
      
      <Content>
        <ControlPanel>
          <FormGroup>
            <Label>选择角色</Label>
            <Select 
              value={selectedRoleId} 
              onChange={(e) => handleRoleChange(e.target.value)}
            >
              <option value="">请选择角色</option>
              {filteredRoles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name} ({roleUserCounts[role.id] || 0}人)
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <Label>抽取人数</Label>
            <Input 
              type="number" 
              min="1" 
              max={availableUsers.length}
              value={drawCount} 
              onChange={(e) => handleCountChange(e.target.value)}
              disabled={!selectedRoleId || availableUsers.length === 0}
            />
            <small style={{ color: '#909399', fontSize: '12px' }}>
              当前角色下共有 {availableUsers.length} 个用户
            </small>
          </FormGroup>

          <Button 
            onClick={handleDraw}
            disabled={!selectedRoleId || !drawCount || availableUsers.length === 0}
          >
            开始抽取
          </Button>
        </ControlPanel>

        <ResultPanel>
          <ResultTitle>抽取结果</ResultTitle>
          <ResultContainer>
            {result.length > 0 ? (
              <UserList>
                {result.map((user, index) => (
                  <UserItem key={user.id}>
                    <UserInfo>
                      <div>
                        <UserName>{user.name || user.username}</UserName>
                        <div style={{ fontSize: '12px', color: '#909399', marginTop: '4px' }}>
                          {user.userType || '未知角色'}
                        </div>
                      </div>
                      <UserRole>#{index + 1}</UserRole>
                    </UserInfo>
                  </UserItem>
                ))}
              </UserList>
            ) : (
              <EmptyMessage>
                请选择角色后点击"开始抽取"按钮
              </EmptyMessage>
            )}
          </ResultContainer>
        </ResultPanel>
      </Content>
    </Container>
  );
};

export default RandomDrawPage;
