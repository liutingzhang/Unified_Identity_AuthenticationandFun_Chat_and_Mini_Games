import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const DataContext = createContext();

const api = axios.create({
  baseURL: '/api'
});

export const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [systems, setSystems] = useState([]);
  const [logs, setLogs] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [tokenConfig, setTokenConfig] = useState({});
  const [votes, setVotes] = useState([]);

  const refetchAllData = useCallback(async () => {
    try {
      const [usersRes, rolesRes, systemsRes, logsRes, permissionsRes, tokenConfigRes, votesRes] = await Promise.all([
        api.get('/users'),
        api.get('/roles'),
        api.get('/systems'),
        api.get('/logs'),
        api.get('/permissions'),
        api.get('/tokenConfig'),
        api.get('/votes')
      ]);
      setUsers(usersRes.data);
      setRoles(rolesRes.data);
      setSystems(systemsRes.data);
      setLogs(logsRes.data.sort((a, b) => new Date(b.time) - new Date(a.time)));
      setPermissions(permissionsRes.data);
      setTokenConfig(tokenConfigRes.data);
      // 确保votes数据是数组
      setVotes(Array.isArray(votesRes.data) ? votesRes.data : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // 如果获取失败，设置votes为空数组
      setVotes([]);
    }
  }, []);

  useEffect(() => {
    refetchAllData();
  }, [refetchAllData]);

  const logAction = useCallback(async (action) => {
    let username = 'system';
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.username) {
          username = user.username;
        }
      }
    } catch (e) {
      console.error('Could not parse user from localStorage for logging', e);
    }
    
    const newLog = {
      user: username,
      action,
      ip: '127.0.0.1',
      time: new Date().toISOString(),
      source: '系统日志'
    };
    try {
      await api.post('/logs', newLog);
    } catch (error) {
      console.error("Failed to log action:", error);
    }
  }, []);

  // --- CRUD Operations --- //

  // 检查并自动创建不存在的角色
  const ensureRoleExists = useCallback(async (roleName) => {
    try {
      // 检查角色是否已存在
      const existingRoles = roles.filter(role => role.name === roleName);
      if (existingRoles.length === 0 && roleName && roleName.trim() !== '') {
        // 角色不存在，创建新角色
        const newRole = {
          name: roleName,
          description: `自动创建的角色: ${roleName}`
        };
        await api.post('/roles', newRole);
        await logAction(`自动创建角色: ${roleName}`);
        console.log(`自动创建了新角色: ${roleName}`);
      }
    } catch (error) {
      console.error(`检查/创建角色失败: ${roleName}`, error);
      throw error;
    }
  }, [roles, logAction]);

  const addUser = useCallback(async (user) => {
    try {
      // 检查用户是否已存在
      const existingUser = users.find(u => u.username === user.username);
      if (existingUser) {
        throw new Error(`用户 ${user.username} 已存在`);
      }
      
      // 先确保角色存在
      if (user.userType && user.userType.trim() !== '') {
        await ensureRoleExists(user.userType);
      }
      
      const newUser = { ...user, registered: new Date().toISOString() };
      await api.post('/users', newUser);
      await logAction(`创建用户: ${user.username}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  }, [users, logAction, refetchAllData, ensureRoleExists]);

  const updateUser = useCallback(async (updatedUser) => {
    try {
      await api.put(`/users/${updatedUser.id}`, updatedUser);
      await logAction(`更新用户: ${updatedUser.username}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const deleteUser = useCallback(async (userId) => {
    try {
      const userToDelete = users.find(u => u.id === userId);
      await api.delete(`/users/${userId}`);
      if (userToDelete) {
        await logAction(`删除用户: ${userToDelete.username}`);
      }
      await refetchAllData();
    } catch (error) {
      console.error("Failed to delete user:", error);
      throw error;
    }
  }, [users, logAction, refetchAllData]);

  const addRole = useCallback(async (role) => {
    try {
      await api.post('/roles', role);
      await logAction(`创建角色: ${role.name}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to add role:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const updateRole = useCallback(async (updatedRole) => {
    try {
      await api.put(`/roles/${updatedRole.id}`, updatedRole);
      await logAction(`更新角色: ${updatedRole.name}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update role:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const deleteRole = useCallback(async (roleId) => {
    try {
      const roleToDelete = roles.find(r => r.id === roleId);
      if (!roleToDelete) {
        throw new Error('角色不存在');
      }
      
      // 获取该角色下的所有用户
      const usersToDelete = users.filter(u => u.userType === roleToDelete.name);
      
      // 先删除该角色下的所有用户
      for (const user of usersToDelete) {
        await api.delete(`/users/${user.id}`);
        await logAction(`删除用户: ${user.username} (角色: ${roleToDelete.name})`);
      }
      
      // 然后删除角色本身
      await api.delete(`/roles/${roleId}`);
      await logAction(`删除角色: ${roleToDelete.name}，同时删除了 ${usersToDelete.length} 个用户`);
      
      await refetchAllData();
    } catch (error) {
      console.error("Failed to delete role:", error);
      throw error;
    }
  }, [roles, users, logAction, refetchAllData]);

  const addSystem = useCallback(async (system) => {
    try {
      await api.post('/systems', system);
      await logAction(`添加系统: ${system.name}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to add system:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const updateSystem = useCallback(async (updatedSystem) => {
    try {
      await api.put(`/systems/${updatedSystem.id}`, updatedSystem);
      await logAction(`更新系统: ${updatedSystem.name}`);
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update system:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const deleteSystem = useCallback(async (systemId) => {
    try {
      const systemToDelete = systems.find(s => s.id === systemId);
      await api.delete(`/systems/${systemId}`);
      if (systemToDelete) {
        await logAction(`删除系统: ${systemToDelete.name}`);
      }
      await refetchAllData();
    } catch (error) {
      console.error("Failed to delete system:", error);
      throw error;
    }
  }, [systems, logAction, refetchAllData]);

  const updatePermissions = useCallback(async (newPermissions) => {
    try {
      await api.post('/permissions', newPermissions);
      await logAction('更新权限设置');
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update permissions:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);
  
  const updateTokenConfig = useCallback(async (newTokenConfig) => {
    try {
      await api.post('/tokenConfig', newTokenConfig);
      await logAction('更新令牌配置');
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update token config:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  // 投票系统相关操作
  const updateVotes = useCallback(async (newVotes) => {
    try {
      // 如果是数组，则批量更新整个投票列表
      if (Array.isArray(newVotes)) {
        // 先清空现有投票数据
        await api.delete('/votes');
        // 然后逐个添加新投票
        for (const vote of newVotes) {
          await api.post('/votes', vote);
        }
      } else {
        // 如果是单个投票对象，则创建新投票
        await api.post('/votes', newVotes);
      }
      await logAction('更新投票数据');
      // 重新获取数据确保一致性
      await refetchAllData();
    } catch (error) {
      console.error("Failed to update votes:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  // 删除单个投票
  const deleteVote = useCallback(async (voteId) => {
    try {
      await api.delete(`/votes/${voteId}`);
      await logAction(`删除投票 ${voteId}`);
      // 重新获取数据确保一致性
      await refetchAllData();
    } catch (error) {
      console.error("Failed to delete vote:", error);
      throw error;
    }
  }, [logAction, refetchAllData]);

  const value = {
    users, addUser, updateUser, deleteUser,
    roles, addRole, updateRole, deleteRole,
    systems, addSystem, updateSystem, deleteSystem,
    permissions, updatePermissions,
    tokenConfig, updateTokenConfig,
    votes, updateVotes, deleteVote,
    logs,
    refetchAllData,
    ensureRoleExists
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
