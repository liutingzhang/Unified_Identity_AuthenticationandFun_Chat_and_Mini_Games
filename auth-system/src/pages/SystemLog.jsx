import React, { useState, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

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

const FilterContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
  width: 250px;
`;

const Select = styled.select`
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--border-color);
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

const PaginationContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  margin: 0 5px;
  padding: 6px 14px;
  border: 1px solid ${props => props.active ? 'transparent' : 'var(--border-color)'};
  background: ${props => props.active ? 'linear-gradient(135deg, var(--primary-color), var(--primary-hover-color))' : 'rgba(255, 255, 255, 0.85)'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    box-shadow: 0 8px 16px var(--shadow-light);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const formatTimestamp = (isoString) => {
  if (!isoString) {
    return '未知时间';
  }

  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return isoString;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('Failed to format timestamp', error);
    return isoString;
  }
};

const SystemLog = () => {
  const { logs } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  const actionTypes = useMemo(() => {
    const allActions = logs.map(log => log.action);
    return ['all', ...new Set(allActions)];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let tempLogs = [...logs].sort((a, b) => {
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();

      if (!Number.isNaN(timeA) && !Number.isNaN(timeB)) {
        return timeB - timeA;
      }

      if (!Number.isNaN(timeB)) return 1;
      if (!Number.isNaN(timeA)) return -1;

      return (b.id || 0) - (a.id || 0);
    });

    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      tempLogs = tempLogs.filter(log => 
        log.user.toLowerCase().includes(lowercasedTerm) ||
        log.action.toLowerCase().includes(lowercasedTerm) ||
        log.ip.toLowerCase().includes(lowercasedTerm)
      );
    }

    if (actionFilter !== 'all') {
      tempLogs = tempLogs.filter(log => log.action === actionFilter);
    }

    return tempLogs;
  }, [logs, searchTerm, actionFilter]);

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  return (
    <Container>
      <Header>
        <Title>系统日志</Title>
      </Header>
      <FilterContainer>
        <SearchInput 
          type="text"
          placeholder="搜索用户、操作或IP..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Select value={actionFilter} onChange={e => {
          setActionFilter(e.target.value);
          setCurrentPage(1);
        }}>
          {actionTypes.map(action => (
            <option key={action} value={action}>{action === 'all' ? '所有操作类型' : action}</option>
          ))}
        </Select>
      </FilterContainer>
      <Table>
        <thead>
          <tr>

            <Th>用户</Th>
            <Th>操作</Th>
            <Th>IP地址</Th>
            <Th>时间</Th>
            <Th>来源</Th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map(log => (
            <StyledTr key={log.id}>
              <Td>{log.user}</Td>
              <Td>{log.action}</Td>
              <Td>{log.ip}</Td>
              <Td>{formatTimestamp(log.time)}</Td>
              <Td>{log.details || '-'}</Td>
            </StyledTr>
          ))}
        </tbody>
      </Table>
      <PaginationContainer>
        <PageButton onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          上一页
        </PageButton>
        <span> 第 {currentPage} / {totalPages} 页 </span>
        <PageButton onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          下一页
        </PageButton>
      </PaginationContainer>
    </Container>
  );
};

export default SystemLog;
