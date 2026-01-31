import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

// Re-using styles from AddUser for consistency
const Container = styled.div`
  padding: 28px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 36px var(--shadow-light);
  max-width: 900px;
  margin: 32px auto;
  backdrop-filter: blur(20px);
`;

const Title = styled.h2`
  margin: 0 0 24px 0;
  font-size: 28px;
  color: var(--text-primary);
  text-align: center;
  font-family: 'Ma Shan Zheng', cursive;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;
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
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background-color: ${props => props.readOnly ? 'rgba(245, 247, 250, 0.9)' : 'rgba(255, 255, 255, 0.9)'};
  transition: all 0.2s ease;
  &:focus { box-shadow: 0 0 0 3px var(--ring-color); }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.9);
  &:focus { box-shadow: 0 0 0 3px var(--ring-color); }
`;

const RadioGroup = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
`;

const RadioLabel = styled.label`
  margin-right: 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const RadioInput = styled.input`
  margin-right: 8px;
`;

const ButtonGroup = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.25s ease;
  box-shadow: 0 10px 20px var(--shadow-medium);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 28px var(--shadow-dark);
  }
`;

const BackButton = styled.button`
  background-color: var(--bg-surface);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  padding: 12px 28px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s ease;
  &:hover {
    background-color: #ffffff;
    box-shadow: 0 8px 18px var(--shadow-light);
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

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { users, roles, updateUser } = useData();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const userToEdit = users.find(u => u.id == userId);
    if (userToEdit) {
      setFormData(userToEdit);
    } else {
      // Optionally, handle user not found case, e.g., show a message or redirect
      navigate('/users');
    }
  }, [userId, users, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 创建要更新的用户数据
    const updatedUser = { ...formData };
    
    // 如果密码字段为空，则不更新密码
    if (!updatedUser.password || updatedUser.password.trim() === '') {
      delete updatedUser.password;
    }
    
    updateUser(updatedUser);
    navigate('/users');
  };

  if (!formData) {
    return <div>Loading user data...</div>; // Or a spinner component
  }

  return (
    <Container>
      <Title>编辑用户信息</Title>
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <Label htmlFor="username">用户名/工号</Label>
          <Input type="text" id="username" name="username" value={formData.username} readOnly />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="name">姓名 *</Label>
          <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="password">用户密码</Label>
          <Input 
            type="text" 
            id="password" 
            name="password" 
            placeholder="留空则不修改密码" 
            value={formData.password || ''} 
            onChange={handleChange} 
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="userType">用户类型 *</Label>
          <Select id="userType" name="userType" value={formData.userType} onChange={handleChange}>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.name}</option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup>
          <Label>性别 *</Label>
          <RadioGroup>
            <RadioLabel>
              <RadioInput type="radio" name="gender" value="男" checked={formData.gender === '男'} onChange={handleChange} /> 男
            </RadioLabel>
            <RadioLabel>
              <RadioInput type="radio" name="gender" value="女" checked={formData.gender === '女'} onChange={handleChange} /> 女
            </RadioLabel>
          </RadioGroup>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="email">电子邮箱</Label>
          <Input type="email" id="email" name="email" value={formData.email || ''} onChange={handleChange} />
        </FormGroup>
        <FormGroup>
          <Label>注册时间</Label>
          <Input type="text" value={formatDateTime(formData.registered)} readOnly />
        </FormGroup>
        <ButtonGroup>
          <SubmitButton type="submit">保存更改</SubmitButton>
          <BackButton type="button" onClick={() => navigate('/users')}>返回列表</BackButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default EditUser;
