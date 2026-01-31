import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled from 'styled-components';
import * as XLSX from 'xlsx';
import { useData } from '../context/DataContext';
import { FaDownload, FaUpload, FaFileExcel, FaTimesCircle } from 'react-icons/fa';

const Container = styled.div`
  padding: 40px;
  background: var(--bg-surface);
  border: var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-medium);
  max-width: 1080px;
  margin: 32px auto;
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

const Title = styled.h2`
  margin: 0 0 32px 0;
  font-size: 32px;
  color: var(--text-primary);
  text-align: center;
  font-family: 'Ma Shan Zheng', cursive;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(111, 78, 55, 0.1);
  position: relative;
  display: inline-block;
  width: 100%;
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background: var(--primary-color);
    margin: 12px auto 0;
    border-radius: 2px;
    opacity: 0.6;
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.4);
  padding: 24px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.6);
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  color: var(--text-primary);
  margin-bottom: 20px;
  border-bottom: 2px solid rgba(111, 78, 55, 0.1);
  padding-bottom: 8px;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const DownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover-color));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 15px;
  text-decoration: none;
  transition: all 0.3s var(--ease-spring);
  box-shadow: 
    0 8px 16px -4px rgba(111, 78, 55, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  font-weight: 600;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 
      0 12px 22px -4px rgba(111, 78, 55, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.4);
  }
`;

const InfoBox = styled.div`
  background-color: rgba(111, 78, 55, 0.04);
  border-left: 4px solid var(--primary-color);
  padding: 20px;
  border-radius: 8px;
  margin-top: 24px;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.8;
  border: 1px solid rgba(111, 78, 55, 0.05);

  ul {
    padding-left: 20px;
    margin: 12px 0 0 0;
  }
  
  li {
    margin-bottom: 6px;
  }
`;

const DropzoneContainer = styled.div`
  border: 2px dashed var(--border-color);
  padding: 50px 24px;
  text-align: center;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s var(--ease-spring);
  background: rgba(255, 255, 255, 0.5);
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: var(--primary-color);
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }

  &.drag-active {
    border-color: var(--primary-color);
    background: rgba(111, 78, 55, 0.05);
    box-shadow: 0 12px 24px rgba(111, 78, 55, 0.1);
    transform: scale(1.02);
  }
`;

const UploadIcon = styled(FaUpload)`
  font-size: 56px;
  color: var(--primary-color);
  margin-bottom: 20px;
  filter: drop-shadow(0 4px 8px rgba(111, 78, 55, 0.2));
  transition: transform 0.3s ease;
  
  ${DropzoneContainer}:hover & {
    transform: translateY(-4px);
  }
`;

const UploadButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  margin-top: 24px;
  transition: all 0.3s var(--ease-spring);
  box-shadow: 
    0 10px 20px -4px rgba(111, 78, 55, 0.3),
    inset 0 1px 0 rgba(255,255,255,0.3);
  font-weight: 600;
  letter-spacing: 1px;

  &:hover {
    transform: translateY(-2px) scale(1.01);
    box-shadow: 
      0 14px 28px -4px rgba(111, 78, 55, 0.4),
      inset 0 1px 0 rgba(255,255,255,0.4);
  }

  &:disabled {
    background: #dcdcdc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
    color: #999;
  }
`;

const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: white;
  border: 1px solid rgba(111, 78, 55, 0.1);
  border-radius: 12px;
  margin-top: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0,0,0,0.06);
    transform: translateY(-1px);
  }
`;

const RemoveFileButton = styled.button`
  background: none;
  border: none;
  color: #f5222d;
  cursor: pointer;
  font-size: 18px;
  padding: 0;
  margin-left: auto;
`;

const BatchImport = () => {
  const { addUser, ensureRoleExists } = useData();
  const [file, setFile] = useState(null);

  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false
  });

  const handleImport = () => {
    if (!file) {
      alert('请先选择或拖拽一个XLSX文件！');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // 跳过表头
        const headers = jsonData[0];
        const rows = jsonData.slice(1);

        const usersToImport = rows.map(row => {
          const user = {};
          headers.forEach((header, index) => {
            if (header === '用户名') user.username = row[index];
            if (header === '密码') user.password = row[index];
            if (header === '姓名') user.name = row[index];
            if (header === '性别') user.gender = row[index];
            if (header === '用户类型') user.userType = row[index];
          });
          return user;
        });

        // Basic validation
        const validUsers = usersToImport.filter(u => u.username && u.password && u.name && u.gender);

        if (validUsers.length !== usersToImport.length) {
          alert('部分数据格式不正确，请检查XLSX文件。');
          return;
        }

        // 首先检查并创建所有不存在的角色
        const uniqueRoles = [...new Set(validUsers.map(u => u.userType || '学生'))];
        
        try {
          // 批量创建不存在的角色
          for (const roleName of uniqueRoles) {
            await ensureRoleExists(roleName);
          }
          
          const importResults = {
            success: 0,
            duplicate: 0,
            errors: []
          };
          
          // 然后批量导入用户
          for (const user of validUsers) {
            try {
              await addUser({
                ...user,
                userType: user.userType || '学生'
              });
              importResults.success++;
            } catch (error) {
              if (error.message.includes('已存在')) {
                importResults.duplicate++;
              } else {
                importResults.errors.push({
                  username: user.username,
                  error: error.message
                });
              }
            }
          }
          
          // 显示导入结果
          let resultMessage = `导入完成！
`;
          resultMessage += `成功导入: ${importResults.success} 个用户
`;
          resultMessage += `重复用户: ${importResults.duplicate} 个（已跳过）
`;
          
          if (importResults.errors.length > 0) {
            resultMessage += `导入失败: ${importResults.errors.length} 个用户`;
            console.error('导入失败的用户:', importResults.errors);
          }
          
          if (importResults.success > 0) {
            resultMessage += `
自动创建了 ${uniqueRoles.length} 个角色。`;
          }
          
          alert(resultMessage);
          setFile(null);
        } catch (error) {
          alert('导入过程中出现错误，请检查控制台获取详细信息。');
          console.error('批量导入失败:', error);
        }
      } catch (error) {
        alert('文件解析失败，请检查文件格式是否正确。');
        console.error('XLSX parsing error:', error);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const createXLSXTemplate = () => {
    const wsData = [
      ['用户名', '密码', '姓名', '性别', '用户类型'],
      ['teacher001', 'pass123', '张三', '男', '老师'],
      ['student001', 'pass456', '李四', '女', '学生']
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '用户模板');
    
    return XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  };

  const xlsxData = new Blob([createXLSXTemplate()], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const xlsxURL = window.URL.createObjectURL(xlsxData);

  return (
    <Container>
      <Title>批量导入用户</Title>
      <ContentGrid>
        <Section>
          <SectionTitle>1. 下载模板</SectionTitle>
          <p>请下载模板文件，并按照说明填写用户信息。</p>
          <DownloadButton href={xlsxURL} download="user_template.xlsx">
            <FaDownload /> 下载XLSX模板
          </DownloadButton>
          <InfoBox>
            <strong>注意事项：</strong>
            <ul>
              <li>请确保文件为Excel格式（.xlsx）。</li>
              <li><code style={{color: 'red'}}>用户名, 密码, 姓名, 性别</code> 为必填项。</li>
              <li><code>用户类型</code> 为选填项，默认为“学生”。</li>
            </ul>
          </InfoBox>
        </Section>
        <Section>
          <SectionTitle>2. 上传文件</SectionTitle>
          <DropzoneContainer {...getRootProps()} className={isDragActive ? 'drag-active' : ''}>
            <input {...getInputProps()} />
            <UploadIcon />
            {isDragActive ?
              <p>将文件拖拽到这里...</p> :
              <p>将XLSX文件拖拽到此处，或点击选择文件</p>
            }
          </DropzoneContainer>
          {file && (
            <FilePreview>
              <FaFileExcel style={{ fontSize: '24px', color: '#007bff' }} />
              <span>{file.name}</span>
              <RemoveFileButton onClick={() => setFile(null)}>
                <FaTimesCircle />
              </RemoveFileButton>
            </FilePreview>
          )}
          <UploadButton onClick={handleImport} disabled={!file}>
            <FaUpload /> 上传并导入
          </UploadButton>
        </Section>
      </ContentGrid>
    </Container>
  );
};

export default BatchImport;
