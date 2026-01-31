import React from 'react';
import styled, { keyframes } from 'styled-components';
import Sidebar from './Sidebar';
import Header from './Header';

// --- Keyframes ---
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: var(--bg-gradient);
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  position: relative;
  
  /* Custom Scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(111, 78, 55, 0.2);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(111, 78, 55, 0.4);
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 32px 40px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.8s ease-out;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const Footer = styled.footer`
  text-align: center;
  padding: 24px 0;
  color: var(--text-light);
  font-size: 14px;
  font-family: 'Ma Shan Zheng', cursive;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  margin-top: auto;
`;

const Layout = ({ children }) => {
  return (
    <LayoutContainer>
      <Sidebar />
      <MainContent>
        <Header />
        <ContentArea>
          {children}
        </ContentArea>
        <Footer>
          © 2025 认证系统 | 为您提供安全、可靠的身份认证服务
        </Footer>
      </MainContent>
    </LayoutContainer>
  );
};

export default Layout;