import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaArrowRight, FaShieldAlt, FaFingerprint } from 'react-icons/fa';

// --- Animations ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const gradientFlow = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const shine = keyframes`
  0% { transform: translateX(-100%) skewX(-15deg); }
  50% { transform: translateX(100%) skewX(-15deg); }
  100% { transform: translateX(100%) skewX(-15deg); }
`;

const rotateSlow = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.4); }
  70% { opacity: 1; box-shadow: 0 0 0 6px rgba(105, 240, 174, 0); }
  100% { opacity: 0.6; box-shadow: 0 0 0 0 rgba(105, 240, 174, 0); }
`;

const staggeredFadeUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Styled Components ---

const PageContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fdfbf7;
  background-image: 
    radial-gradient(at 10% 10%, rgba(111, 78, 55, 0.05) 0px, transparent 50%),
    radial-gradient(at 90% 90%, rgba(62, 39, 35, 0.08) 0px, transparent 50%),
    radial-gradient(circle at 50% 50%, #ffffff 0%, #f3ece7 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Noto Serif SC', serif;
`;

const BackgroundShape = styled.div`
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  z-index: 0;
  animation: ${float} 8s ease-in-out infinite;

  &.shape-1 {
    width: 600px;
    height: 600px;
    background: linear-gradient(135deg, #d7ccc8, #efebe9);
    top: -200px;
    left: -100px;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 500px;
    height: 500px;
    background: linear-gradient(135deg, #efebe9, #d7ccc8);
    bottom: -150px;
    right: -100px;
    animation-delay: -4s;
  }
  
  &.shape-3 {
    width: 300px;
    height: 300px;
    background: rgba(161, 136, 127, 0.1);
    top: 40%;
    left: 20%;
    animation-duration: 12s;
  }
`;

const LoginCard = styled.div`
  display: flex;
  width: 1000px;
  max-width: 90vw;
  height: 640px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(25px) saturate(180%);
  -webkit-backdrop-filter: blur(25px) saturate(180%);
  border-radius: 32px;
  box-shadow: 
    0 25px 50px -12px rgba(62, 39, 35, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.6) inset;
  z-index: 10;
  overflow: hidden;
  animation: ${fadeIn} 1s cubic-bezier(0.2, 0.8, 0.2, 1);
  
  @media (max-width: 900px) {
    flex-direction: column;
    height: auto;
    width: 95vw;
    max-width: 450px;
  }
`;

const moveUp = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0; }
  50% { opacity: 0.5; }
  100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
`;

const LeftPanel = styled.div`
  flex: 1;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 80px 60px;
  background: linear-gradient(135deg, #2D1B18 0%, #4E342E 100%); /* 加深一点，增加对比度 */
  color: white;
  
  /* 噪点纹理 - 增加胶片质感 */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E");
    opacity: 0.08;
    z-index: 2;
    pointer-events: none;
    mix-blend-mode: overlay;
  }

  /* 十字网格图案 (保留并优化) */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    z-index: 1;
    mask-image: radial-gradient(circle at 50% 30%, black 40%, transparent 100%); /* 改为径向遮罩，中心清晰四周淡出 */
  }

  @media (max-width: 900px) {
    padding: 40px 20px;
    flex: 0.5;
    justify-content: center;
  }
`;

/* 丁达尔光束效果 */
const LightBeam = styled.div`
  position: absolute;
  top: -20%;
  left: 20%;
  width: 100px;
  height: 150%;
  background: linear-gradient(to bottom, rgba(255,255,255,0.08) 0%, transparent 100%);
  transform: rotate(25deg);
  filter: blur(15px);
  z-index: 1;
  pointer-events: none;
  animation: ${float} 10s ease-in-out infinite alternate;

  &.beam-2 {
    left: 45%;
    width: 60px;
    opacity: 0.5;
    animation-duration: 15s;
    animation-delay: -2s;
  }
  
  &.beam-3 {
    left: -10%;
    width: 150px;
    opacity: 0.3;
    animation-duration: 12s;
    animation-delay: -5s;
  }
`;

/* 悬浮粒子 */
const Particle = styled.div`
  position: absolute;
  background: white;
  border-radius: 50%;
  opacity: 0;
  z-index: 1;
  pointer-events: none;
  animation: ${moveUp} ${props => props.duration || '10s'} infinite linear;
  animation-delay: ${props => props.delay || '0s'};
  left: ${props => props.left || '50%'};
  bottom: -20px;
  width: ${props => props.size || '4px'};
  height: ${props => props.size || '4px'};
  box-shadow: 0 0 10px rgba(255,255,255,0.8);
`;

const DecorativeLine = styled.div`
  width: 80px; /* 改长一点 */
  height: 2px; /* 变细 */
  background: rgba(255, 255, 255, 0.4);
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #fff;
    transform: translateX(-100%);
    animation: ${shine} 4s infinite cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const BrandContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const BrandIconContainer = styled.div`
  position: relative;
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  
  /* 多重边框实现棱镜感 */
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02));
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 
    0 8px 32px rgba(0,0,0,0.1),
    inset 0 0 0 1px rgba(255,255,255,0.1);
  backdrop-filter: blur(12px);
  
  /* 内部光晕 */
  &::before {
    content: '';
    position: absolute;
    inset: 10px;
    border-radius: 14px;
    background: radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), transparent 70%);
    opacity: 0.5;
  }

  /* 悬停效果 */
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  &:hover {
    transform: translateY(-5px) scale(1.02);
    box-shadow: 
      0 15px 40px rgba(0,0,0,0.2),
      inset 0 0 0 1px rgba(255,255,255,0.3);
    border-color: rgba(255,255,255,0.4);
    
    svg {
      transform: scale(1.1);
      filter: drop-shadow(0 0 15px rgba(255,255,255,0.6));
    }
  }

  svg {
    font-size: 2.8rem;
    color: rgba(255,255,255,0.95);
    z-index: 2;
    filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));
    transition: all 0.5s ease;
  }
`;

const BrandTitle = styled.h1`
  margin: 0;
  line-height: 1;
  color: white;
  
  /* 英文标题 */
  span {
    color: rgba(255, 255, 255, 0.4);
    font-weight: 300;
    display: block;
    font-size: 0.9rem; /* 更小更精致 */
    letter-spacing: 0.3em; /* 增加字间距 */
    text-transform: uppercase;
    margin-bottom: 12px;
    font-family: 'Inter', sans-serif;
  }
  
  /* 中文标题 */
  div {
    font-size: 3.2rem;
    font-weight: 600; /* 稍微减细一点，不要太笨重 */
    letter-spacing: 0.1em;
    background: linear-gradient(to bottom, #fff 30%, rgba(255,255,255,0.7));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  }
`;

const BrandSubtitle = styled.div`
  margin-top: 32px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.05em;
  line-height: 1.8;
  max-width: 320px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1); /* 改为上边框 */
  font-family: 'Inter', sans-serif;
`;

const SystemStatus = styled.div`
  z-index: 2;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.3);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;

  /* 呼吸灯优化 */
  &::before {
    content: '';
    width: 6px;
    height: 6px;
    background-color: #69F0AE; /* 更高级的荧光绿 */
    border-radius: 50%;
    box-shadow: 0 0 10px rgba(105, 240, 174, 0.6);
    animation: ${pulse} 2s infinite;
  }
`;

const GlassCircle = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1), rgba(255,255,255,0.01));
  backdrop-filter: blur(5px);
  z-index: 0;
  border: 1px solid rgba(255,255,255,0.05);
  
  &.circle-1 {
    width: 300px;
    height: 300px;
    top: -50px;
    right: -100px;
    opacity: 0.4;
  }
  
  &.circle-2 {
    width: 150px;
    height: 150px;
    bottom: 100px;
    left: -50px;
    opacity: 0.3;
  }
`;

const RightPanel = styled.div`
  flex: 1.2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px;
  position: relative;
  background: rgba(255, 255, 255, 0.4);

  @media (max-width: 900px) {
    padding: 40px 20px;
  }
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 380px;
`;

const WelcomeText = styled.div`
  margin-bottom: 40px;
  text-align: left;
  opacity: 0;
  animation: ${staggeredFadeUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.2s;
  
  h2 {
    font-size: 2rem;
    color: #3E2723;
    margin: 0 0 10px 0;
    font-weight: 700;
    font-family: 'Playfair Display', 'Noto Serif SC', serif; /* 强调衬线体的高级感 */
    letter-spacing: -0.5px;
  }
  
  p {
    color: #8D6E63;
    margin: 0;
    font-size: 1rem;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; /* 功能性文字用无衬线 */
    letter-spacing: 0.5px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 32px;
  opacity: 0;
  animation: ${staggeredFadeUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  
  /* 自动交错延迟 */
  &:nth-of-type(1) { animation-delay: 0.3s; }
  &:nth-of-type(2) { animation-delay: 0.4s; }
`;

const FloatingLabel = styled.label`
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: #A1887F;
  pointer-events: none;
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  transform-origin: left center;
  z-index: 1;
  text-shadow: 0 2px 4px rgba(255,255,255,0.5);
  font-family: 'Inter', sans-serif; /* 无衬线字体 */
`;

const Input = styled.input`
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid rgba(141, 110, 99, 0.15);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  font-size: 1rem;
  color: #3E2723;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; /* 确保输入内容清晰 */
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 
    0 2px 10px rgba(0, 0, 0, 0.02),
    inset 0 0 0 1px rgba(255, 255, 255, 0.5);

  &:hover {
    background: rgba(255, 255, 255, 0.8);
    border-color: rgba(141, 110, 99, 0.3);
  }

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: #8D6E63;
    box-shadow: 
      0 10px 30px -10px rgba(141, 110, 99, 0.2),
      inset 0 0 0 1px rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: transparent;
  }

  /* Floating Label Trigger */
  &:focus ~ ${FloatingLabel},
  &:not(:placeholder-shown) ~ ${FloatingLabel} {
    transform: translate(-38px, -52px) scale(0.85); 
    color: #5D4037;
    font-weight: 600;
    letter-spacing: 1px;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #A1887F;
  transition: all 0.3s ease;
  z-index: 2;
  font-size: 1.2rem;

  ${Input}:focus ~ & {
    color: #5D4037;
    transform: translateY(-50%) scale(1.1);
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  margin-top: 24px;
  opacity: 0;
  animation: ${staggeredFadeUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.5s;
`;

const Button = styled.button`
  width: 100%;
  padding: 18px;
  /* 高级流体渐变背景 */
  background: linear-gradient(110deg, #5D4037 0%, #8D6E63 50%, #3E2723 100%);
  background-size: 200% 100%;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: 'Inter', sans-serif; /* 优化字体 */
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); /* 弹性过渡 */
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 10px 20px rgba(62, 39, 35, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  letter-spacing: 2px;
  z-index: 1;

  /* 默认背景流动 */
  animation: ${gradientFlow} 6s ease infinite;

  svg {
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 
      0 20px 40px rgba(62, 39, 35, 0.35),
      inset 0 1px 0 rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.2);
    /* 加速背景流动 */
    animation: ${gradientFlow} 3s ease infinite;
    
    svg {
      transform: translateX(6px) scale(1.1);
    }
  }
  
  &:active {
    transform: translateY(-2px) scale(0.98);
    box-shadow: 0 5px 15px rgba(62, 39, 35, 0.25);
  }
  
  /* 极光扫光效果 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s ease;
    z-index: -1;
  }
  
  &:hover::before {
    left: 100%;
    transition: left 0.8s ease;
  }
`;

const ErrorMessage = styled.div`
  color: #D32F2F;
  font-size: 0.9rem;
  background: rgba(211, 47, 47, 0.08);
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  animation: ${fadeIn} 0.3s ease-out;
  border: 1px solid rgba(211, 47, 47, 0.1);
  
  svg {
    flex-shrink: 0;
  }
`;

const FooterText = styled.p`
  margin-top: 30px;
  font-size: 0.8rem;
  color: #A1887F;
  text-align: center;
  font-family: 'Inter', sans-serif;
  opacity: 0;
  animation: ${staggeredFadeUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: 0.6s;
  
  a {
    color: #5D4037;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
      text-decoration: underline;
      color: #3E2723;
    }
  }
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);
    // Simulate a brief loading for better UX
    setTimeout(async () => {
      try {
        const success = await login(username, password);
        if (success) {
          navigate('/');
        } else {
          setError('用户名或密码错误');
          setLoading(false);
        }
      } catch (err) {
        setError('登录过程中发生错误');
        console.error(err);
        setLoading(false);
      }
    }, 800);
  };

  return (
    <PageContainer>
      <BackgroundShape className="shape-1" />
      <BackgroundShape className="shape-2" />
      <BackgroundShape className="shape-3" />
      
      <LoginCard>
        <LeftPanel>
          <GlassCircle className="circle-1" />
          <GlassCircle className="circle-2" />
          
          <LightBeam className="beam-1" />
          <LightBeam className="beam-2" />
          <LightBeam className="beam-3" />
          
          <Particle size="3px" left="20%" duration="15s" delay="0s" />
          <Particle size="5px" left="50%" duration="20s" delay="-5s" />
          <Particle size="2px" left="80%" duration="18s" delay="-10s" />
          
          <BrandContent>
            <BrandIconContainer>
              <FaShieldAlt />
            </BrandIconContainer>
            <DecorativeLine />
            <BrandTitle>
              <span>Unified Auth</span>
              <div>统一认证</div>
            </BrandTitle>
            <BrandSubtitle>
              安全、高效、统一的身份管理入口<br/>
              Secure Identity Management Gateway
            </BrandSubtitle>
          </BrandContent>

          <SystemStatus>
            System Online • V2.0
          </SystemStatus>
        </LeftPanel>
        
        <RightPanel>
          <FormContainer>
            <WelcomeText>
              <h2>欢迎回来</h2>
              <p>请登录以访问您的账户</p>
            </WelcomeText>

            <Form onSubmit={handleLogin}>
              <InputGroup>
                <Input 
                  type="text" 
                  placeholder=" "
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  id="username"
                />
                <FloatingLabel htmlFor="username">用户名</FloatingLabel>
                <IconWrapper>
                  <FaUser />
                </IconWrapper>
              </InputGroup>
              
              <InputGroup>
                <Input 
                  type="password" 
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  id="password"
                />
                <FloatingLabel htmlFor="password">密码</FloatingLabel>
                <IconWrapper>
                  <FaLock />
                </IconWrapper>
              </InputGroup>

              {error && (
                <ErrorMessage>
                  <FaShieldAlt size={14} /> <span>{error}</span>
                </ErrorMessage>
              )}
              
              <ButtonContainer>
                <Button type="submit" disabled={loading}>
                  {loading ? <span>登录中...</span> : (
                    <>
                      <span>登 录</span> <FaArrowRight size={14} />
                    </>
                  )}
                </Button>
              </ButtonContainer>
            </Form>
            
            <FooterText>
              忘记密码？ <a href="#">联系管理员</a>
            </FooterText>
          </FormContainer>
        </RightPanel>
      </LoginCard>
    </PageContainer>
  );
};

export default LoginPage;
