import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Card = styled.div`
  background: var(--bg-surface);
  padding: 30px;
  border-radius: var(--radius-lg);
  box-shadow: 0 14px 36px var(--shadow-light);
  border: 1px solid var(--border-color);
  max-width: 680px;
  margin: 32px auto;
  backdrop-filter: blur(18px);
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  font-size: 26px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 15px;
  font-family: 'Ma Shan Zheng', cursive;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 18px;
  margin-bottom: 30px;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: var(--text-secondary);
`;

const InfoValue = styled.span`
  color: var(--text-primary);
`;

const Profile = () => {
  const { user } = useAuth();
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

  if (!user) {
    return <p>请先登录</p>;
  }

  return (
    <Card>
      <Title>个人资料</Title>
      <InfoGrid>
        <InfoLabel>用户名:</InfoLabel>
        <InfoValue>{user.username}</InfoValue>

        <InfoLabel>姓名:</InfoLabel>
        <InfoValue>{user.name}</InfoValue>

        <InfoLabel>用户类型:</InfoLabel>
        <InfoValue>{user.userType}</InfoValue>

        <InfoLabel>性别:</InfoLabel>
        <InfoValue>{user.gender}</InfoValue>

        <InfoLabel>邮箱:</InfoLabel>
        <InfoValue>{user.email || '-'}</InfoValue>

        <InfoLabel>注册时间:</InfoLabel>
        <InfoValue>{formatDateTime(user.registered)}</InfoValue>
      </InfoGrid>
    </Card>
  );
};

export default Profile;
