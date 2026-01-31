import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import Modal from '../components/Modal';

const Container = styled.div`
  padding: 28px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 36px var(--shadow-light);
  backdrop-filter: blur(18px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 26px;
  color: var(--text-primary);
  font-family: 'Ma Shan Zheng', cursive;
`;

const AddButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 10px 22px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 10px 18px var(--shadow-medium);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 26px var(--shadow-dark);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: left;

  tbody tr:hover {
    background-color: rgba(122, 91, 75, 0.06);
  }
`;

const Th = styled.th`
  background-color: var(--table-header-bg);
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
`;

const Td = styled.td`
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
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
  margin: 0 5px;
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  font-weight: 500;

  &.open {
    background-color: rgba(111, 78, 55, 0.1);
    color: var(--primary-color);
    border: 1px solid var(--primary-color);
    &:hover {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &.edit {
    background-color: var(--secondary-color);
    color: var(--primary-hover-color);
    border: 1px solid var(--border-color);
    &:hover {
      background-color: var(--primary-hover-color);
      color: white;
    }
  }

  &.delete {
    background-color: #FAF2F0;
    color: #C62828;
    border: 1px solid #FFCDD2;
    &:hover {
      background-color: #C62828;
      color: white;
    }
  }
`;

const StatusTag = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  background-color: rgba(82, 196, 26, 0.08);
  color: #2b8a3e;
  border: 1px solid rgba(82, 196, 26, 0.3);
  transition: all 0.3s ease;
  letter-spacing: 0.5px;

  &:hover {
    background-color: rgba(82, 196, 26, 0.15);
    border-color: rgba(82, 196, 26, 0.5);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(82, 196, 26, 0.1);
  }
`;

const SystemManagement = () => {
  const { systems, addSystem, updateSystem, deleteSystem } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState(null);

  const normalizeUrl = (value) => {
    if (!value) return '';
    let url = String(value).trim();
    if (!url) return '';
    if (url.startsWith('/')) return url;
    
    if (!/^https?:\/\//i.test(url)) {
      url = `http://${url}`;
    }

    // Replace localhost with window.location.hostname to support LAN access
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
        urlObj.hostname = window.location.hostname;
        return urlObj.toString();
      }
    } catch (e) {
      // Fallback
      return url.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
    
    return url;
  };

  const openSystem = (system) => {
    const target = normalizeUrl(system?.url);
    if (!target) {
      alert('系统URL为空，请先编辑填写URL');
      return;
    }
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  const openModal = (system = null) => {
    setEditingSystem(system);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSystem(null);
  };

  const handleSave = (systemData) => {
    if (editingSystem) {
      updateSystem({ ...editingSystem, ...systemData });
    } else {
      addSystem(systemData);
    }
    closeModal();
  };

  return (
    <Container>
      <Header>
        <Title>接入系统管理</Title>
        <AddButton onClick={() => openModal()}>添加系统</AddButton>
      </Header>
      <Table>
        <thead>
          <tr>

            <Th>系统名称</Th>
            <Th>系统URL</Th>
            <Th>状态</Th>
            <Th style={{ paddingLeft: '20px' }}>操作</Th>
          </tr>
        </thead>
        <tbody>
          {systems.map(system => (
            <StyledTr key={system.id}>

              <Td>{system.name}</Td>
              <Td>
                {system.url ? (
                  <a href={normalizeUrl(system.url)} target="_blank" rel="noreferrer">
                    {system.url}
                  </a>
                ) : (
                  <span style={{ color: '#ccc' }}>未设置</span>
                )}
              </Td>
              <Td>
                <StatusTag>
                  运行正常
                </StatusTag>
              </Td>
              <Td>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <ActionButton className="open" onClick={() => openSystem(system)}>
                    访问
                  </ActionButton>
                  <ActionButton className="edit" onClick={() => openModal(system)}>
                    编辑
                  </ActionButton>
                  <ActionButton className="delete" onClick={() => {
                    if (window.confirm('确定要删除该系统吗？')) {
                      deleteSystem(system.id);
                    }
                  }}>
                    删除
                  </ActionButton>
                </div>
              </Td>
            </StyledTr>
          ))}
        </tbody>
      </Table>
      <SystemModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        onSave={handleSave} 
        system={editingSystem} 
      />
    </Container>
  );
};

// Modal specific styled components
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
  font-weight: 600;
  color: var(--text-secondary);
`;
const Input = styled.input`
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
`;
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
`;
const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 10px;
`;

const SystemModal = ({ isOpen, onClose, onSave, system }) => {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (system) {
      setName(system.name);
      setUrl(system.url || '');
      setActive(system.active);
    } else {
      setName('');
      setUrl('');
      setActive(true);
    }
  }, [system]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) {
      alert('系统名称不能为空');
      return;
    }
    // Ensure status is set based on active boolean for consistency
    const status = active ? 'active' : 'stopped';
    onSave({ name, url, active, status });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Form onSubmit={handleSubmit}>
        <h2>{system ? '编辑系统' : '添加新系统'}</h2>
        <FormGroup>
          <Label>系统名称 *</Label>
          <Input type="text" value={name} onChange={e => setName(e.target.value)} required />
        </FormGroup>
        <FormGroup>
          <Label>系统URL</Label>
          <Input type="text" value={url} onChange={e => setUrl(e.target.value)} />
        </FormGroup>
        <FormGroup>
          <CheckboxLabel>
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            激活系统
          </CheckboxLabel>
        </FormGroup>
        <ButtonGroup>
          <button type="button" className="secondary" onClick={onClose}>取消</button>
          <button type="submit" className="primary">保存</button>
        </ButtonGroup>
      </Form>
    </Modal>
  );
};

export default SystemManagement;
