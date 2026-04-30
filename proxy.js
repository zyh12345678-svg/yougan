const express = require('express');
const fetch = require('node-fetch');
const app = express();
// 从环境变量读取端口，不存在则使用3000
const port = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// ========== 模型后缀配置 ==========
const SHAPE_MODEL_SUFFIX = 'shape2_model';
const SKIN_MODEL_SUFFIX = 'skin_model';
const STEM_MODEL_SUFFIX = 'stem_model';
// =================================

// 代理获取 token
app.post('/api/token', async (req, res) => {
  const { apiKey, secretKey } = req.body;
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  console.log('🔑 [Token] 请求中...');
  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    if (data.access_token) {
      console.log('✅ [Token] 获取成功');
    } else {
      console.log('❌ [Token] 失败:', data);
    }
    res.json(data);
  } catch (err) {
    console.error('❌ [Token] 错误:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 通用模型调用函数
async function callModel(req, res, modelSuffix, modelName) {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/${modelSuffix}?access_token=${accessToken}`;
  console.log(`📡 [${modelName}] 请求URL:`, url);
  console.log(`📡 [${modelName}] 图片长度:`, imageBase64 ? imageBase64.length : 0);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    console.log(`📡 [${modelName}] 响应:`, JSON.stringify(data));
    
    // 如果返回错误码3，说明URL可能不对
    if (data.error_code === 3) {
      console.error(`❌ [${modelName}] 模型地址错误！请检查后缀是否正确`);
      console.error(`   当前使用的完整URL: ${url}`);
    }
    res.json(data);
  } catch (err) {
    console.error(`❌ [${modelName}] 请求错误:`, err.message);
    res.status(500).json({ error: err.message });
  }
}

// 代理调用油柑识别模型（第一关）
app.post('/api/classify', async (req, res) => {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/yougan_api?access_token=${accessToken}`;
  console.log('📡 [油柑识别] 请求中...');
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    console.log('📡 [油柑识别] 响应:', data);
    res.json(data);
  } catch (err) {
    console.error('❌ [油柑识别] 错误:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// 代理：预测果形
app.post('/api/predict_shape', async (req, res) => {
  await callModel(req, res, SHAPE_MODEL_SUFFIX, '果形');
});

// 代理：预测果皮
app.post('/api/predict_skin', async (req, res) => {
  await callModel(req, res, SKIN_MODEL_SUFFIX, '果皮');
});

// 代理：预测果蒂
app.post('/api/predict_stem', async (req, res) => {
  await callModel(req, res, STEM_MODEL_SUFFIX, '果蒂');
});

app.listen(port, () => {
  console.log("服务启动成功！端口：", port);
  console.log(`📋 模型配置:`);
  console.log(`   果形模型后缀: ${SHAPE_MODEL_SUFFIX}`);
  console.log(`   果皮模型后缀: ${SKIN_MODEL_SUFFIX}`);
  console.log(`   果蒂模型后缀: ${STEM_MODEL_SUFFIX}`);
  console.log(`\n✨ 请访问 http://localhost:${port}/index.html\n`);
});
