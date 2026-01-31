import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import './VoteSystem.css';

const VoteSystem = () => {
  const { votes: dataVotes, updateVotes, deleteVote: deleteVoteFromContext } = useData();
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState(['', '']);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // 初始化投票数据
  useEffect(() => {
    if (Array.isArray(dataVotes)) {
      setVotes(dataVotes);
    } else {
      setVotes([]);
    }
  }, [dataVotes]);

  // 安全获取投票数据
  const getSafeVotes = () => {
    return Array.isArray(votes) ? votes : [];
  };

  // 安全获取投票对象
  const getSafeVote = (vote) => {
    if (!vote) return { id: 0, title: '', options: [], voters: [], isActive: false, creator: '' };
    return {
      id: vote.id || 0,
      title: vote.title || '',
      options: Array.isArray(vote.options) ? vote.options : [],
      voters: Array.isArray(vote.voters) ? vote.voters : [],
      isActive: vote.isActive !== undefined ? vote.isActive : false,
      creator: vote.creator || '',
      createdAt: vote.createdAt || new Date().toISOString()
    };
  };

  // 创建新投票
  const createVote = async () => {
    if (!newVoteTitle.trim() || newVoteOptions.some(opt => !opt.trim())) {
      alert('请填写投票标题和所有选项');
      return;
    }

    setLoading(true);
    try {
      const newVote = {
        id: Date.now(),
        title: newVoteTitle.trim(),
        options: newVoteOptions.filter(opt => opt.trim()).map(opt => ({
          id: Date.now() + Math.random(),
          text: opt.trim(),
          votes: 0,
          voters: []
        })),
        creator: user?.username || '匿名用户',
        createdAt: new Date().toISOString(),
        isActive: true,
        voters: []
      };

      const updatedVotes = [...getSafeVotes(), newVote];
      
      // 先更新服务器，再更新本地状态
      await updateVotes(updatedVotes);
      
      // 重置表单
      setNewVoteTitle('');
      setNewVoteOptions(['', '']);
      setIsCreating(false);
    } catch (error) {
      console.error('创建投票失败:', error);
      alert('创建投票失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 投票
  const voteForOption = async (voteId, optionId) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentVotes = getSafeVotes();
      const updatedVotes = currentVotes.map(vote => {
        const safeVote = getSafeVote(vote);
        if (safeVote.id === voteId) {
          // 检查用户是否已经投过票
          if (safeVote.voters.includes(user?.username)) {
            alert('您已经投过票了');
            return safeVote;
          }

          return {
            ...safeVote,
            options: safeVote.options.map(opt => 
              opt.id === optionId 
                ? { ...opt, votes: (opt.votes || 0) + 1, voters: [...(opt.voters || []), user?.username] }
                : opt
            ),
            voters: [...safeVote.voters, user?.username]
          };
        }
        return safeVote;
      });

      // 更新服务器和本地状态
      await updateVotes(updatedVotes);
    } catch (error) {
      console.error('投票失败:', error);
      alert('投票失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 结束投票
  const endVote = async (voteId) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const currentVotes = getSafeVotes();
      const updatedVotes = currentVotes.map(vote => {
        const safeVote = getSafeVote(vote);
        return safeVote.id === voteId ? { ...safeVote, isActive: false } : safeVote;
      });
      
      await updateVotes(updatedVotes);
    } catch (error) {
      console.error('结束投票失败:', error);
      alert('结束投票失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 删除单个投票
  const handleDeleteVote = async (voteId) => {
    if (loading) return;
    
    if (!window.confirm('确定要删除这个投票吗？')) return;
    
    setLoading(true);
    try {
      console.log('开始删除投票，voteId:', voteId);
      
      // 使用专门的删除API
      await deleteVoteFromContext(voteId);
      console.log('投票删除成功');
      alert('投票删除成功');
    } catch (error) {
      console.error('删除投票失败:', error);
      alert('删除投票失败，请重试。错误信息: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 删除所有投票
  const deleteAllVotes = async () => {
    if (loading) return;
    
    if (!window.confirm('确定要删除所有投票记录吗？此操作不可撤销！')) return;
    
    setLoading(true);
    try {
      console.log('开始删除所有投票');
      const currentVotes = getSafeVotes();
      console.log('当前投票数量:', currentVotes.length);
      
      if (currentVotes.length === 0) {
        alert('当前没有投票记录可删除');
        return;
      }
      
      // 清空投票数据
      await updateVotes([]);
      console.log('所有投票删除成功');
      alert(`成功删除 ${currentVotes.length} 个投票记录`);
    } catch (error) {
      console.error('删除所有投票失败:', error);
      alert('删除所有投票失败，请重试。错误信息: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 添加选项
  const addOption = () => {
    setNewVoteOptions([...newVoteOptions, '']);
  };

  // 更新选项文本
  const updateOptionText = (index, text) => {
    const updatedOptions = [...newVoteOptions];
    updatedOptions[index] = text;
    setNewVoteOptions(updatedOptions);
  };

  // 删除选项
  const removeOption = (index) => {
    if (newVoteOptions.length > 2) {
      const updatedOptions = newVoteOptions.filter((_, i) => i !== index);
      setNewVoteOptions(updatedOptions);
    }
  };

  // 计算投票总数
  const getTotalVotes = (vote) => {
    const safeVote = getSafeVote(vote);
    return safeVote.options.reduce((total, opt) => total + (opt.votes || 0), 0);
  };

  // 检查用户是否已经投票
  const hasVoted = (vote) => {
    const safeVote = getSafeVote(vote);
    if (!user) return false;
    return safeVote.voters.includes(user.username);
  };

  const safeVotes = getSafeVotes();

  return (
    <div className="vote-system">
      <div className="vote-header">
        <h1>投票系统</h1>
        <div className="header-actions">
          <button 
            className="btn btn-primary" 
            onClick={() => setIsCreating(!isCreating)}
            disabled={loading}
          >
            {isCreating ? '取消创建' : '创建新投票'}
          </button>
          {safeVotes.length > 0 && (
            <button 
              className="btn btn-danger" 
              onClick={deleteAllVotes}
              disabled={loading}
            >
              {loading ? '删除中...' : '删除所有投票'}
            </button>
          )}
        </div>
      </div>

      {/* 创建投票表单 */}
      {isCreating && (
        <div className="create-vote-form">
          <h3>创建新投票</h3>
          <div className="form-group">
            <label>投票标题：</label>
            <input
              type="text"
              value={newVoteTitle}
              onChange={(e) => setNewVoteTitle(e.target.value)}
              placeholder="请输入投票标题"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>投票选项：</label>
            {newVoteOptions.map((option, index) => (
              <div key={index} className="option-input">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  placeholder={`选项 ${index + 1}`}
                  disabled={loading}
                />
                {newVoteOptions.length > 2 && (
                  <button 
                    type="button" 
                    className="btn btn-danger btn-sm"
                    onClick={() => removeOption(index)}
                    disabled={loading}
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
            <button 
              type="button" 
              className="btn btn-secondary btn-sm"
              onClick={addOption}
              disabled={loading}
            >
              添加选项
            </button>
          </div>
          
          <div className="form-actions">
            <button 
              className="btn btn-primary" 
              onClick={createVote}
              disabled={loading}
            >
              {loading ? '创建中...' : '创建投票'}
            </button>
          </div>
        </div>
      )}

      {/* 投票列表 */}
      <div className="votes-list">
        {safeVotes.length === 0 ? (
          <div className="no-votes">
            <p>暂无投票，点击上方按钮创建第一个投票吧！</p>
          </div>
        ) : (
          safeVotes.map(vote => {
            const safeVote = getSafeVote(vote);
            return (
              <div key={safeVote.id} className="vote-card">
                <div className="vote-header">
                  <h3>{safeVote.title}</h3>
                  <div className="vote-meta">
                    <span>创建者：{safeVote.creator}</span>
                    <span>创建时间：{new Date(safeVote.createdAt).toLocaleString()}</span>
                    <span className={`status ${safeVote.isActive ? 'active' : 'ended'}`}>
                      {safeVote.isActive ? '进行中' : '已结束'}
                    </span>
                  </div>
                  {user && (user.username === safeVote.creator || user.userType === 'admin') ? (
                    <div className="vote-actions">
                      {safeVote.isActive && (
                        <button 
                          className="btn btn-warning btn-sm"
                          onClick={() => endVote(safeVote.id)}
                          disabled={loading}
                        >
                          结束投票
                        </button>
                      )}
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteVote(safeVote.id)}
                        disabled={loading}
                      >
                        删除
                      </button>
                    </div>
                  ) : (
                    <div className="vote-info">
                      <span>只有创建者或管理员可以管理此投票</span>
                    </div>
                  )}
                </div>

                <div className="vote-options">
                  {safeVote.options.map(option => {
                    const totalVotes = getTotalVotes(safeVote);
                    const percentage = totalVotes > 0 ? ((option.votes || 0) / totalVotes) * 100 : 0;
                    
                    return (
                      <div key={option.id} className="vote-option">
                        <div className="option-info">
                          <span className="option-text">{option.text}</span>
                          <span className="vote-count">
                            {option.votes || 0} 票 ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        {safeVote.isActive && !hasVoted(safeVote) && (
                          <button 
                            className="btn btn-primary btn-sm"
                            onClick={() => voteForOption(safeVote.id, option.id)}
                            disabled={loading}
                          >
                            投票
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="vote-footer">
                  <span>总票数：{getTotalVotes(safeVote)}</span>
                  {hasVoted(safeVote) && <span className="voted-indicator">✓ 已投票</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VoteSystem;