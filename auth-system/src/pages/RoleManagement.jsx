import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';

const Container = styled.div`
  padding: 32px;
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

  &:disabled {
    cursor: not-allowed;
    background-color: rgba(0,0,0,0.05);
    color: #bbb;
    box-shadow: none;
    border: 1px solid transparent;
  }

  &.view {
    background-color: rgba(111, 78, 55, 0.08);
    color: var(--primary-color);
    box-shadow: inset 0 0 0 1px rgba(111, 78, 55, 0.2);
    &:hover:not(:disabled) {
      background-color: var(--primary-color);
      color: white;
      box-shadow: 0 4px 12px rgba(111, 78, 55, 0.2);
    }
  }
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
    cursor: not-allowed;
    background-color: rgba(0,0,0,0.05) !important;
    color: #bbb !important;
    box-shadow: none !important;
    border: 1px solid transparent !important;
  }
`;

const RoleManagement = () => {
  const { roles, addRole, updateRole, deleteRole, users } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [viewingRole, setViewingRole] = useState(null);

  const openModal = (role = null) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const openMembersModal = (role) => {
    setViewingRole(role);
    setIsMembersModalOpen(true);
  };

  const closeMembersModal = () => {
    setIsMembersModalOpen(false);
    setViewingRole(null);
  };

  const handleSave = (roleData) => {
    if (editingRole) {
      updateRole({ ...editingRole, ...roleData });
    } else {
      addRole(roleData);
    }
    closeModal();
  };

  const roleMembers = viewingRole ? users.filter(u => u.userType === viewingRole.name) : [];

  return (
    <Container>
      <Header>
        <Title>角色管理</Title>
        <AddButton onClick={() => openModal()}>添加角色</AddButton>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>角色名称</Th>
            <Th>角色描述</Th>
            <Th>用户数</Th>
            <Th style={{ paddingLeft: '20px' }}>操作</Th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <StyledTr key={role.id}>
              <Td>{role.name}</Td>
              <Td>{role.description}</Td>
              <Td>{users.filter(u => u.userType === role.name).length}</Td>
              <Td style={{ textAlign: 'left' }}>
                <ActionButton className="view" onClick={() => openMembersModal(role)}>查看成员</ActionButton>
                <ActionButton className="edit" onClick={() => openModal(role)} disabled={role.name === '超级管理员' || role.name === 'Super Admin'}>编辑</ActionButton>
                <ActionButton className="delete" onClick={() => { 
                  const usersCount = users.filter(u => u.userType === role.name).length;
                  if (usersCount > 0) {
                    if (window.confirm(`该角色有 ${usersCount} 个用户正在使用。确定要删除该角色并同时删除所有相关用户吗？`)) {
                      deleteRole(role.id);
                    }
                  } else {
                    if (window.confirm('确定要删除该角色吗？')) deleteRole(role.id);
                  }
                }} disabled={role.name === '超级管理员' || role.name === 'Super Admin'}>删除</ActionButton>
              </Td>
            </StyledTr>
          ))}
        </tbody>
      </Table>
      <RoleModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        role={editingRole} 
      />
      <MembersModal
        isOpen={isMembersModalOpen}
        onClose={closeMembersModal}
        role={viewingRole}
        members={roleMembers}
      />
    </Container>
  );
};

// Styled components for the modal form
const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;
const Label = styled.label`
  margin-bottom: 8px;
  font-weight: 500;
`;
const Input = styled.input`
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const RoleModal = ({ isOpen, onClose, onSave, role }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [role]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      alert('角色名称不能为空');
      return;
    }
    onSave({ name, description });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <h2>{role ? '编辑角色' : '添加新角色'}</h2>
        <FormGroup>
          <Label>角色名称 *</Label>
          <Input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="例如：管理员" required />
        </FormGroup>
        <FormGroup>
          <Label>角色描述</Label>
          <Input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="例如：拥有所有权限" />
        </FormGroup>
        <ButtonGroup>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button type="submit" className="primary">保存</button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

const MembersModal = ({ isOpen, onClose, role, members }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>{role?.name} 成员列表</h2>
      {members.length > 0 ? (
        <ul>
          {members.map(member => (
            <li key={member.id}>{member.name} ({member.username})</li>
          ))}
        </ul>
      ) : (
        <p>该角色下暂无成员。</p>
      )}
    </Modal>
  );
};

export default RoleManagement;
