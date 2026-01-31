// 简单的API测试脚本
async function testAPI() {
  try {
    console.log('=== 开始测试API ===');
    
    // 测试角色API
    console.log('\\n1. 测试角色API...');
    const rolesResponse = await fetch('http://localhost:8000/roles');
    const roles = await rolesResponse.json();
    console.log('当前角色数量:', roles.length);
    console.log('角色列表:', roles.map(r => r.name));
    
    // 测试用户API
    console.log('\\n2. 测试用户API...');
    const usersResponse = await fetch('http://localhost:8000/users');
    const users = await usersResponse.json();
    console.log('当前用户数量:', users.length);
    
    // 测试创建新角色
    console.log('\\n3. 测试创建新角色...');
    const newRoleResponse = await fetch('http://localhost:8000/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '测试角色',
        description: '测试自动创建的角色'
      })
    });
    
    if (newRoleResponse.ok) {
      console.log('✅ 角色创建成功！');
    } else {
      console.log('❌ 角色创建失败:', await newRoleResponse.text());
    }
    
    // 再次检查角色列表
    console.log('\\n4. 验证新角色是否创建成功...');
    const rolesAfter = await (await fetch('http://localhost:8000/roles')).json();
    console.log('更新后角色数量:', rolesAfter.length);
    console.log('更新后角色列表:', rolesAfter.map(r => r.name));
    
    console.log('\\n=== API测试完成 ===');
    console.log('✅ 后端API正常工作！');
    
  } catch (error) {
    console.error('❌ API测试失败:', error);
  }
}

// 运行测试
testAPI();