const XLSX = require('xlsx');

// 创建测试数据
const data = [
  ['用户名', '密码', '姓名', '性别', '用户类型'],
  ['testuser001', 'password123', '张三', '男', '新角色1'],
  ['testuser002', 'password456', '李四', '女', '新角色2'],
  ['testuser003', 'password789', '王五', '男', '管理员'],
  ['testuser004', 'password000', '赵六', '女', '新角色3']
];

// 创建工作表
const ws = XLSX.utils.aoa_to_sheet(data);

// 创建工作簿并添加工作表
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, '测试数据');

// 写入文件
XLSX.writeFile(wb, 'test_import_users.xlsx');

console.log('测试文件已创建: test_import_users.xlsx');
console.log('文件中包含以下角色测试:');
console.log('- 新角色1 (新角色，应该自动创建)');
console.log('- 新角色2 (新角色，应该自动创建)');
console.log('- 管理员 (已有角色，不需要创建)');
console.log('- 新角色3 (新角色，应该自动创建)');