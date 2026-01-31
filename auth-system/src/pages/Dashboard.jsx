import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useData } from '../context/DataContext';
import { 
  FaUsers, 
  FaUserShield, 
  FaServer, 
  FaClipboardList, 
  FaClock, 
  FaArrowRight,
  FaBell,
  FaDatabase,
  FaFeatherAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

// --- Animations ---
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseSoft = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(111, 78, 55, 0.1); }
  70% { box-shadow: 0 0 0 10px rgba(111, 78, 55, 0); }
  100% { box-shadow: 0 0 0 0 rgba(111, 78, 55, 0); }
`;

// --- Styled Components ---

const DashboardContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const HeaderSection = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 8px;
  animation: ${fadeInUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const WelcomeWrapper = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -12px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    opacity: 0.6;
  }
`;

const WelcomeTitle = styled.h1`
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 3.2rem;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  line-height: 1.1;
  background: linear-gradient(135deg, #3E2723 0%, #8D6E63 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05));
  letter-spacing: 2px;
`;

const WelcomeSubtitle = styled.p`
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 1.05rem;
  color: var(--text-light);
  margin: 0;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;

  svg {
    color: var(--primary-color);
    font-size: 0.9em;
  }
`;

const DateBadge = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  padding: 12px 28px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  color: var(--text-secondary);
  font-family: system-ui, -apple-system, sans-serif;
  font-weight: 500;
  font-size: 0.95rem;
  box-shadow: 
    0 4px 20px rgba(111, 78, 55, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(111, 78, 55, 0.12);
  }

  svg {
    color: var(--primary-color);
    font-size: 1.1em;
  }
`;

// --- Grid Layout ---
const BentoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto 1fr;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(24px) saturate(180%);
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  padding: 28px;
  box-shadow: 
    0 10px 40px -10px rgba(62, 39, 35, 0.06),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
  animation: ${fadeInUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) backwards;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  /* Subtle Noise Texture Overlay */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0.03;
    pointer-events: none;
    z-index: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  &:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: 
      0 20px 48px -12px rgba(62, 39, 35, 0.12),
      0 0 0 1px rgba(255, 255, 255, 0.8) inset;
    background: rgba(255, 255, 255, 0.85);
    z-index: 1;
  }

  ${props => props.$gridArea && css`grid-area: ${props.$gridArea};`}
  ${props => props.$delay && css`animation-delay: ${props.$delay};`}
`;

// --- Stat Card Specifics ---
const StatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
`;

const IconBox = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: ${props => props.$bg || '#eee'};
  color: ${props => props.$color || '#333'};
  box-shadow: 
    0 10px 20px -6px ${props => props.$shadow || 'rgba(0,0,0,0.1)'},
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.4s ease;

  ${Card}:hover & {
    transform: scale(1.1) rotate(-5deg);
  }
`;

const StatTitle = styled.h3`
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.9rem;
  color: var(--text-light);
  margin: 0;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

const StatContent = styled.div`
  margin-top: auto;
  position: relative;
  z-index: 1;
`;

const StatValue = styled.div`
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 4rem;
  line-height: 0.9;
  color: var(--text-primary);
  margin-bottom: 8px;
  letter-spacing: -1px;
  
  span {
    font-size: 1rem;
    font-family: system-ui, -apple-system, sans-serif;
    color: var(--text-light);
    margin-left: 6px;
    font-weight: 500;
    letter-spacing: 0;
  }
`;

// --- Activity Feed ---
const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(111, 78, 55, 0.1);
  position: relative;
  z-index: 1;
`;

const SectionTitle = styled.h2`
  font-family: 'Ma Shan Zheng', cursive;
  font-size: 1.6rem;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  max-height: 380px;
  padding-right: 8px;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(111, 78, 55, 0.1);
    border-radius: 4px;
  }
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid transparent;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.9);
    border-color: rgba(111, 78, 55, 0.1);
    transform: translateX(6px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
`;

const ActivityIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #FFF;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
`;

const ActivityDetails = styled.div`
  flex: 1;
`;

const ActivityText = styled.p`
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  
  strong {
    font-weight: 600;
    color: #3E2723;
  }
`;

const ActivityTime = styled.span`
  font-size: 0.8rem;
  color: var(--text-light);
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '';
    display: block;
    width: 6px;
    height: 6px;
    background: #CCC;
    border-radius: 50%;
  }
`;

// --- System Status ---
const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const StatusRow = styled.div`
  background: rgba(255, 255, 255, 0.5);
  padding: 16px 20px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  border: 1px solid transparent;

  &:hover {
    background: #fff;
    border-color: rgba(111, 78, 55, 0.1);
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }
`;

const StatusInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatusDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.$active ? '#4CAF50' : '#FF5252'};
  box-shadow: ${props => props.$active ? '0 0 0 4px rgba(76, 175, 80, 0.15)' : '0 0 0 4px rgba(255, 82, 82, 0.15)'};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: -4px;
    left: -4px;
    right: -4px;
    bottom: -4px;
    border-radius: 50%;
    border: 1px solid ${props => props.$active ? '#4CAF50' : '#FF5252'};
    opacity: 0.5;
    animation: ${pulseSoft} 2s infinite;
  }
`;

const StatusName = styled.span`
  font-weight: 600;
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 0.95rem;
`;

const StatusMetric = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-light);
  font-family: 'JetBrains Mono', monospace; /* Monospace for numbers */
  background: rgba(141, 110, 99, 0.08);
  padding: 6px 12px;
  border-radius: 8px;
`;

// --- Quick Actions ---
const ActionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const ActionButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  gap: 16px;
  color: var(--text-secondary);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: #fff;
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(93, 64, 55, 0.1);
    color: var(--primary-color);
  }

  &:hover::before {
    opacity: 1;
  }

  svg {
    font-size: 1.8rem;
    color: var(--text-light);
    transition: all 0.3s ease;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.05));
  }

  &:hover svg {
    color: var(--primary-color);
    transform: scale(1.1);
  }

  span {
    font-family: system-ui, -apple-system, sans-serif;
    font-weight: 600;
    font-size: 0.95rem;
    z-index: 1;
  }
`;

const Dashboard = () => {
  const { users, roles, systems, logs } = useData();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const formatLogTime = (isoString) => {
    try {
      const date = new Date(isoString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return isoString;
    }
  };

  const formatDateTime = (value) => {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const recentLogs = [...logs].sort((a, b) => b.id - a.id).slice(0, 8);

  // Mock system status data with metrics
  const systemStatus = [
    { name: '认证服务', isUp: true, metric: '12ms' },
    { name: '数据库', isUp: true, metric: '45ms' },
    { name: '日志监控', isUp: true, metric: '16ms' },
    { name: 'API 网关', isUp: true, metric: '28ms' },
  ];

  return (
    <DashboardContainer>
      <HeaderSection>
        <WelcomeWrapper>
          <WelcomeTitle>仪表盘</WelcomeTitle>
          <WelcomeSubtitle>
            <FaFeatherAlt /> 欢迎回来，今日系统运行平稳
          </WelcomeSubtitle>
        </WelcomeWrapper>
        <DateBadge>
          <FaClock />
          {formatDateTime(currentTime)}
        </DateBadge>
      </HeaderSection>

      <BentoGrid>
        {/* Stat Cards */}
        <Card $delay="0.1s">
          <StatHeader>
            <IconBox $bg="#E8F5E9" $color="#2E7D32" $shadow="rgba(46, 125, 50, 0.15)">
              <FaUsers />
            </IconBox>
            <StatTitle>总用户数</StatTitle>
          </StatHeader>
          <StatContent>
            <StatValue>{users.length}<span>人</span></StatValue>
          </StatContent>
        </Card>

        <Card $delay="0.2s">
          <StatHeader>
            <IconBox $bg="#E3F2FD" $color="#1565C0" $shadow="rgba(21, 101, 192, 0.15)">
              <FaUserShield />
            </IconBox>
            <StatTitle>角色定义</StatTitle>
          </StatHeader>
          <StatContent>
            <StatValue>{roles.length}<span>组</span></StatValue>
          </StatContent>
        </Card>

        <Card $delay="0.3s">
          <StatHeader>
            <IconBox $bg="#FFF3E0" $color="#EF6C00" $shadow="rgba(239, 108, 0, 0.15)">
              <FaServer />
            </IconBox>
            <StatTitle>接入系统</StatTitle>
          </StatHeader>
          <StatContent>
            <StatValue>{systems.length}<span>个</span></StatValue>
          </StatContent>
        </Card>

        <Card $delay="0.4s">
          <StatHeader>
            <IconBox $bg="#F3E5F5" $color="#7B1FA2" $shadow="rgba(123, 31, 162, 0.15)">
              <FaClipboardList />
            </IconBox>
            <StatTitle>今日日志</StatTitle>
          </StatHeader>
          <StatContent>
            <StatValue>{logs.length}<span>条</span></StatValue>
          </StatContent>
        </Card>

        {/* Big Sections */}
        <Card $gridArea="2 / 1 / 3 / 3" $delay="0.5s">
          <SectionHeader>
            <SectionTitle>
              近期活动
            </SectionTitle>
            <Link to="/logs" style={{ fontSize: '0.9rem', color: 'var(--text-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              查看全部 <FaArrowRight size={12} />
            </Link>
          </SectionHeader>
          <ActivityList>
            {recentLogs.map(log => (
              <ActivityItem key={log.id}>
                <ActivityIcon>
                  <FaBell />
                </ActivityIcon>
                <ActivityDetails>
                  <ActivityText>
                    <strong>{log.user}</strong> {log.action}
                  </ActivityText>
                  <ActivityTime>{formatLogTime(log.time)}</ActivityTime>
                </ActivityDetails>
              </ActivityItem>
            ))}
            {recentLogs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8D6E63' }}>
                暂无活动记录
              </div>
            )}
          </ActivityList>
        </Card>

        <Card $gridArea="2 / 3 / 3 / 4" $delay="0.6s">
          <SectionHeader>
            <SectionTitle>
              服务状态
            </SectionTitle>
          </SectionHeader>
          <StatusGrid>
            {systemStatus.map((service, index) => (
              <StatusRow key={index}>
                <StatusInfo>
                  <StatusDot $active={service.isUp} />
                  <StatusName>{service.name}</StatusName>
                </StatusInfo>
                <StatusMetric>
                  {(() => {
                    const value = service.metric.replace('ms', '');
                    return value.length === 1 ? `0${value}ms` : service.metric;
                  })()}
                </StatusMetric>
              </StatusRow>
            ))}
          </StatusGrid>
        </Card>

        <Card $gridArea="2 / 4 / 3 / 5" $delay="0.7s">
          <SectionHeader>
            <SectionTitle>
              快捷操作
            </SectionTitle>
          </SectionHeader>
          <ActionGrid>
            <ActionButton to="/users/add">
              <FaUsers />
              <span>添加用户</span>
            </ActionButton>
            <ActionButton to="/roles">
              <FaUserShield />
              <span>角色管理</span>
            </ActionButton>
            <ActionButton to="/systems">
              <FaDatabase />
              <span>系统接入</span>
            </ActionButton>
            <ActionButton to="/logs">
              <FaClipboardList />
              <span>查看日志</span>
            </ActionButton>
          </ActionGrid>
        </Card>

      </BentoGrid>
    </DashboardContainer>
  );
};

export default Dashboard;
