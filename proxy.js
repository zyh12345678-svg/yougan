const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// ========== 请在这里填写您三个特征模型的接口地址后缀 ==========
// 例如：您的果形模型完整地址为 https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/shape_model
// 则填写 'shape_model' (只填写后缀部分)
const SHAPE_MODEL_SUFFIX = 'shape2_model';   // 替换为您的果形模型后缀
const SKIN_MODEL_SUFFIX  = 'skin_model';    // 替换为您的果皮模型后缀
const STEM_MODEL_SUFFIX  = 'stem_model';    // 替换为您的果蒂模型后缀
// =============================================================

// 代理获取 token (复用同一应用)
app.post('/api/token', async (req, res) => {
  const { apiKey, secretKey } = req.body;
  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${apiKey}&client_secret=${secretKey}`;
  try {
    const response = await fetch(url, { method: 'POST' });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 代理调用油柑识别模型（第一关）
app.post('/api/classify', async (req, res) => {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/yougan_api?access_token=${accessToken}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 代理：预测果形
app.post('/api/predict_shape', async (req, res) => {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/${SHAPE_MODEL_SUFFIX}?access_token=${accessToken}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 代理：预测果皮
app.post('/api/predict_skin', async (req, res) => {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/${SKIN_MODEL_SUFFIX}?access_token=${accessToken}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 代理：预测果蒂
app.post('/api/predict_stem', async (req, res) => {
  const { accessToken, imageBase64 } = req.body;
  const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/classification/${STEM_MODEL_SUFFIX}?access_token=${accessToken}`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageBase64 })
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`代理服务运行在 http://localhost:${PORT}`));