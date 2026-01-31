import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const DrawContainer = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const DrawTitle = styled.h3`
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const DrawForm = styled.div`
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  min-width: 150px;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  width: 80px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: #0056b3;
  }

  &:disabled {
    background-color: #6c757d;
    cursor: not-allowed;
  }
`;

const ResultContainer = styled.div`
  margin-top: 15px;
  padding: 15px;
  background-color: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
`;

const ResultTitle = styled.h4`
  margin: 0 0 10px 0;
  color: #495057;
`;

const UserList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const UserItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #f1f3f4;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #007bff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 10px;
`;

const RandomDraw = () => {
  const { users, roles } = useData();
  const [selectedRole, setSelectedRole] = useState('');
  const [drawCount, setDrawCount] = useState(1);
  const [result, setResult] = useState([]);
  const [error, setError] = useState('');

  // 过滤掉超级管理员角色
  const availableRoles = roles.filter(role => role.name !== '超级管理员');

  // 获取当前选中角色的用户列表
  const roleUsers = users.filter(user => user.userType === selectedRole);

  const handleDraw = () => {
    setError('');
    setResult([]);

    if (!selectedRole) {
      setError('请先选择角色');
      return;
    }

    if (drawCount <= 0) {
      setError('抽取人数必须大于0');
      return;
    }

    if (drawCount > roleUsers.length) {
      setError(`选择的人数不能大于该角色的用户总数（${roleUsers.length}人）`);
      return;
    }

    // 随机抽取用户
    const shuffled = [...roleUsers].sort(() => 0.5 - Math.random());
    const selectedUsers = shuffled.slice(0, drawCount);
    setResult(selectedUsers);
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
  };

  return (
    <DrawContainer>
      <DrawTitle>
        <span>🎲</span>
        随机抽取
      </DrawTitle>
      
      <DrawForm>
        <div>
          <label>选择角色：</label>
          <Select 
            value={selectedRole} 
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="">请选择角色</option>
            {availableRoles.map(role => (
              <option key={role.id} value={role.name}>
                {role.name} ({users.filter(u => u.userType === role.name).length}人)
              </option>
            ))}
          </Select>
        </div>
        
        <div>
          <label>抽取人数：</label>
          <Input 
            type="number" 
            value={drawCount} 
            onChange={(e) => setDrawCount(parseInt(e.target.value) || 0)}
            min="1"
            max={roleUsers.length}
          />
          <span style={{ marginLeft: '5px', color: '#6c757d' }}>
            / {roleUsers.length}人
          </span>
        </div>
        
        <Button 
          onClick={handleDraw}
          disabled={!selectedRole || drawCount <= 0}
        >
          开始抽取
        </Button>
      </DrawForm>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {result.length > 0 && (
        <ResultContainer>
          <ResultTitle>抽取结果 ({result.length}人)：</ResultTitle>
          <UserList>
            {result.map((user, index) => (
              <UserItem key={user.id}>
                <UserInfo>
                  <UserAvatar>
                    {getInitials(user.name)}
                  </UserAvatar>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {user.username} • {user.userType}
                    </div>
                  </div>
                </UserInfo>
                <div style={{ fontSize: '12px', color: '#28a745' }}>
                  第{index + 1}位
                </div>
              </UserItem>
            ))}
          </UserList>
        </ResultContainer>
      )}
    </DrawContainer>
  );
};

export default RandomDraw;