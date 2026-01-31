import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';
import { menuItems as allMenuItems } from '../components/Sidebar'; // Import menu items

// --- Styled Components --- (Copied from your existing file for consistency)
const Container = styled.div`
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 24px;
  color: #333;
`;

const SaveButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background-color: var(--primary-hover-color);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  text-align: center;
`;

const Th = styled.th`
  background-color: var(--table-header-bg);
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  font-weight: 600;
  color: #333;
`;

const Td = styled.td`
  padding: 15px;
  border: 1px solid var(--border-color);
  color: #606266;
`;

const PermissionLabel = styled.td`
  text-align: left;
  font-weight: 500;
`;

const SwitchLabel = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: var(--primary-color);
  }

  &:checked + span:before {
    transform: translateX(22px);
  }

  &:disabled + span {
    background-color: #f0f0f0; /* Lighter grey for disabled */
    cursor: not-allowed;
  }
  
  &:disabled + span:before {
    background-color: #a9a9a9; /* Darker circle for disabled */
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 28px;

  &:before {
    position: absolute;
    content: "";
    height: 20px;
    width: 20px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <SwitchLabel>
    <SwitchInput type="checkbox" checked={checked} onChange={onChange} disabled={disabled} />
    <Slider />
  </SwitchLabel>
);

// --- Main Component --- 

const PermissionManagement = () => {
  const { roles, permissions, updatePermissions } = useData();
  const [localPermissions, setLocalPermissions] = useState(permissions);
  const [hasChanges, setHasChanges] = useState(false);

  // Create a mapping from permission ID to its Chinese name
  const permissionNameMap = useMemo(() => {
    const mapping = {};
    allMenuItems.forEach(item => {
      if (item.group) {
        item.items.forEach(subItem => {
          // 排除批量导入，因为它使用user:manage权限
          if (subItem.requiredPermission && subItem.name !== '批量导入') {
            mapping[subItem.requiredPermission] = subItem.name;
          }
        });
      } else if (item.requiredPermission) {
        mapping[item.requiredPermission] = item.name;
      }
    });
    
    // 添加默认的权限名称映射
    const defaultMappings = {
      'user:manage': '用户管理（包含批量导入）',
      'role:list': '角色管理', 
      'system:list': '系统管理',
      'log:list': '系统日志',
      'permission:edit': '权限管理',
      'random:draw': '随机抽取',
      'roll:call': '点名系统',
      'vote:participate': '投票系统'
    };
    
    // 合并映射，确保所有权限都有中文名称
    Object.keys(defaultMappings).forEach(perm => {
      if (!mapping[perm]) {
        mapping[perm] = defaultMappings[perm];
      }
    });
    
    return mapping;
  }, []);

  // Extract all unique, non-null permissions from the sidebar menu items
  const availablePermissions = useMemo(() => {
    const perms = new Set();
    allMenuItems.forEach(item => {
      if (item.group) {
        item.items.forEach(subItem => {
          // 排除批量导入权限，因为它会通过用户管理权限自动获得
          if (subItem.requiredPermission && subItem.name !== '批量导入') {
            perms.add(subItem.requiredPermission);
          }
        });
      } else if (item.requiredPermission) {
        perms.add(item.requiredPermission);
      }
    });
    
    // 确保包含所有必要的权限，排除批量导入
    const requiredPermissions = [
      'user:manage', 'role:list', 'system:list', 'log:list', 'permission:edit',
      'random:draw', 'roll:call', 'vote:participate' // 添加随机抽取、点名系统和投票系统所需的权限
    ];
    
    requiredPermissions.forEach(perm => {
      perms.add(perm); // 直接添加，确保包含
    });
    
    return Array.from(perms);
  }, []);

  useEffect(() => {
    const newLocalPermissions = {};
    roles.forEach(role => {
      newLocalPermissions[role.name] = permissions[role.name] || [];
    });
    setLocalPermissions(newLocalPermissions);
  }, [permissions, roles]);

  const handleToggle = (roleName, permission) => {
    setLocalPermissions(prev => {
      const rolePerms = prev[roleName] || [];
      const hasPerm = rolePerms.includes(permission);
      const newRolePerms =
        hasPerm
          ? rolePerms.filter(p => p !== permission)
          : [...rolePerms, permission];
      return {
        ...prev,
        [roleName]: newRolePerms,
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updatePermissions(localPermissions);
      setHasChanges(false);
      alert('权限保存成功！');
    } catch (error) {
      alert('权限保存失败，请查看控制台日志。');
    }
  };

  return (
    <Container>
      <Header>
        <Title>权限管理</Title>
        <SaveButton onClick={handleSave} disabled={!hasChanges}>
          保存更改
        </SaveButton>
      </Header>
      <Table>
        <thead>
          <tr>
            <Th>权限 (导航标签)</Th>
            {roles.map(role => (
              <Th key={role.id}>{role.name}</Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {availablePermissions.map(permission => (
            <tr key={permission}>
              <PermissionLabel>{permissionNameMap[permission] || permission}</PermissionLabel>
              {roles.map(role => {
                const isSuperAdmin = role.name === '超级管理员';
                const hasPerm = !!localPermissions[role.name]?.includes(permission);
                return (
                  <Td key={role.id}>
                    <ToggleSwitch
                      checked={isSuperAdmin || hasPerm}
                      disabled={isSuperAdmin}
                      onChange={() => handleToggle(role.name, permission)}
                    />
                  </Td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default PermissionManagement;
