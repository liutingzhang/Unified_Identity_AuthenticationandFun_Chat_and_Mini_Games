import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover-color));
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition: all 0.3s var(--ease-spring);
  box-shadow: 
    0 8px 20px -4px rgba(111, 78, 55, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  
  &:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 
      0 12px 28px -4px rgba(111, 78, 55, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.4);
  }
`;

const FilterContainer = styled.div`
  margin-bottom: 24px;
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px;
  background: rgba(255,255,255,0.4);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255,255,255,0.5);
`;

const SearchInput = styled.input`
  padding: 12px 18px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  width: 280px;
  background: rgba(255,255,255,0.8);
  transition: all 0.3s ease;
  
  &:focus {
    width: 300px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(111, 78, 55, 0.1);
  }
`;

const SortButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'active'
})`
  padding: 10px 20px;
  border-radius: 999px;
  border: 1px solid ${props => props.active ? 'transparent' : 'var(--border-color)'};
  background: ${props => props.active ? 'linear-gradient(135deg, var(--primary-color), var(--primary-hover-color))' : 'rgba(255, 255, 255, 0.6)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  cursor: pointer;
  transition: all 0.3s var(--ease-spring);
  font-weight: 500;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(111, 78, 55, 0.2)' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(111, 78, 55, 0.15);
  }
`;

const SortStatus = styled.span`
  color: var(--text-light);
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  text-align: left;
`;

const Th = styled.th`
  background-color: transparent;
  padding: 16px 24px;
  color: var(--text-light);
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(111, 78, 55, 0.05);
`;

const Td = styled.td`
  padding: 20px 24px;
  color: var(--text-secondary);
  font-weight: 500;
  background: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(0,0,0,0.02);
  
  &:first-child {
    border-top-left-radius: 12px;
    border-bottom-left-radius: 12px;
  }
  
  &:last-child {
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;
  }
`;

const StyledTr = styled.tr`
  transition: all 0.3s var(--ease-spring);
  
  &:hover td {
    background: rgba(255, 255, 255, 0.95);
    transform: scale(1.01);
    box-shadow: 0 8px 20px rgba(111, 78, 55, 0.08);
    z-index: 1;
    position: relative;
  }
`;

const ActionTd = styled(Td)`
  text-align: left;
`;

const ActionButton = styled.button`
  margin: 0 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s var(--ease-spring);
  font-weight: 600;
  letter-spacing: 0.5px;

  &.edit {
    background-color: white;
    color: var(--primary-hover-color);
    box-shadow: 
      0 2px 6px rgba(0,0,0,0.05),
      inset 0 0 0 1px var(--border-color);
    &:hover:not(:disabled) {
      background-color: var(--primary-hover-color);
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(111, 78, 55, 0.15);
    }
  }

  &.delete {
    background-color: rgba(255, 255, 255, 0.5);
    color: #C62828;
    box-shadow: inset 0 0 0 1px rgba(198, 40, 40, 0.2);
    &:hover:not(:disabled) {
      background-color: #C62828;
      color: white;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(198, 40, 40, 0.2);
    }
  }

  &:disabled {
    background-color: rgba(0,0,0,0.05);
    color: #bbb;
    box-shadow: none;
    cursor: not-allowed;
    border: 1px solid transparent;
  }
`;

const formatDateTime = (dateTime) => {
  if (!dateTime) return '-';

  const date = new Date(dateTime);
  if (Number.isNaN(date.getTime())) {
    return dateTime;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { users, deleteUser } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortType, setSortType] = useState(''); // 'userType' 或 ''
  const [filteredUsers, setFilteredUsers] = useState(users);

  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }
    
    let processedUsers = [...users];
    
    // 搜索过滤
    if (searchTerm) {
      const lowercasedFilter = searchTerm.toLowerCase();
      processedUsers = processedUsers.filter(item => {
        if (!item) return false; 
        const usernameMatch = typeof item.username === 'string' && item.username.toLowerCase().includes(lowercasedFilter);
        const nameMatch = typeof item.name === 'string' && item.name.toLowerCase().includes(lowercasedFilter);
        return usernameMatch || nameMatch;
      });
    }
    
    // 按用户类型排序
    if (sortType === 'userType') {
      processedUsers.sort((a, b) => {
        // 定义用户类型的优先级顺序
        const typePriority = {
          '超级管理员': 1,
          '管理员': 2,
          '老师': 3,
          '学生': 4
        };
        
        const priorityA = typePriority[a.userType] || 999;
        const priorityB = typePriority[b.userType] || 999;
        
        // 先按优先级排序，优先级相同则按用户名排序
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        return (a.username || '').localeCompare(b.username || '');
      });
    }
    
    setFilteredUsers(processedUsers);
  }, [searchTerm, users, sortType]);

  const handleEditUser = (userId) => {
    navigate(`/users/edit/${userId}`);
  };

  const handleAddUser = () => {
    navigate('/users/add');
  };

  const handleBatchImport = () => {
    navigate('/users/import');
  };

  const toggleSortByUserType = () => {
    if (sortType === 'userType') {
      setSortType(''); // 取消排序
    } else {
      setSortType('userType'); // 按用户类型排序
    }
  };

  return (
    <Container>
      <Header>
        <Title>用户管理</Title>
        <ButtonGroup>
          <AddButton onClick={handleAddUser}>添加用户</AddButton>
          <AddButton onClick={handleBatchImport}>批量导入</AddButton>
        </ButtonGroup>
      </Header>
      <FilterContainer>
        <SearchInput
          type="text"
          placeholder="按用户名或姓名搜索"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SortButton 
          active={sortType === 'userType'}
          onClick={toggleSortByUserType}
        >
          按用户类型排序
        </SortButton>
        {sortType === 'userType' && (
          <SortStatus>已按用户类型排序（超级管理员→管理员→老师→学生）</SortStatus>
        )}
      </FilterContainer>
      <Table>
        <thead>
          <tr>

            <Th>用户名</Th>
            <Th>用户类型</Th>
            <Th>姓名</Th>
            <Th>性别</Th>
            <Th>邮箱</Th>
            <Th>注册时间</Th>
            <Th style={{ paddingLeft: '20px' }}>操作</Th>
          </tr>
        </thead>
        <tbody>
          {(filteredUsers || []).map(user => (
            <StyledTr key={user.id}>

              <Td>{user.username}</Td>
              <Td>{user.userType}</Td>
              <Td>{user.name}</Td>
              <Td>{user.gender}</Td>
              <Td>{user.email || '-'}</Td>
              <Td>{formatDateTime(user.registered)}</Td>
              <ActionTd>
                <ActionButton className="edit" onClick={() => handleEditUser(user.id)} disabled={user.username === 'admin'}>编辑</ActionButton>
                <ActionButton className="delete" onClick={() => { if (window.confirm('确定要删除该用户吗？')) deleteUser(user.id) }} disabled={user.username === 'admin'}>删除</ActionButton>
              </ActionTd>
            </StyledTr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default UserManagement;
