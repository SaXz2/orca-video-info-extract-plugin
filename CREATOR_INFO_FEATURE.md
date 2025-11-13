# 视频创作者信息提取功能

## 功能概述

此功能扩展了原有的视频信息提取插件，现在不仅能够提取视频基本信息，还能获取视频创作者（UP主、博主、作者）的详细统计信息。

## 新增功能

### 支持的创作者信息字段

- **followerCount**: 粉丝数/订阅者数量
- **homepage**: 主页链接（使用链接属性类型）
- **likeCount**: 获赞数/喜欢数
- **playCount**: 播放量/总播放数
- **videoCount**: 视频数量

### 支持的平台

#### 哔哩哔哩 (Bilibili)
- 粉丝数 (followerCount)
- 主页链接 (homepage) - `https://space.bilibili.com/{mid}`
- 获赞数 (likeCount)
- 播放量 (playCount)
- 视频数 (videoCount)

#### YouTube
- 订阅者数量 (followerCount)
- 主页链接 (homepage) - `https://www.youtube.com/channel/{channelId}`
- 视频数量 (videoCount)
- 总播放数 (playCount)
- 注意：需要配置 YouTube Data API v3 密钥才能获取详细统计信息

#### Vimeo
- 关注者数量 (followerCount)
- 主页链接 (homepage) - 用户个人主页
- 视频数量 (videoCount)
- 喜欢数 (likeCount)
- 注意：需要配置 Vimeo 访问令牌才能获取详细统计信息

## 使用方式

1. **自动识别**: 当你在块中粘贴视频链接时，插件会自动识别并提取信息
2. **手动提取**: 右键点击包含视频链接的块，选择"🎬 提取视频信息"
3. **快捷命令**: 使用编辑器命令 `${pluginName}.extractVideoInfo`

## 标签结构

### 视频创作者标签
创作者信息会存储在具有"视频创作者"标签的块中，包含以下属性：
- `followerCount`: 粉丝数
- `homepage`: 主页链接（链接类型）
- `likeCount`: 获赞数
- `playCount`: 播放量
- `videoCount`: 视频数

### 平台特定标签
- **B站**: `哔哩UP：{UP主名}`
- **YouTube**: `油管博主：{频道名}`
- **Vimeo**: `Vimeo作者：{作者名}`

## 配置要求

### YouTube
- 需要在插件设置中配置 `youtubeApiKey`
- API Key 需要有 YouTube Data API v3 权限

### Vimeo
- 需要在插件设置中配置 `vimeoAccessToken`
- 访问令牌需要适当的权限范围

## 技术实现

### API调用

#### B站API
- 视频信息: `https://api.bilibili.com/x/web-interface/view`
- 用户卡片: `https://api.bilibili.com/x/web-interface/card`
- 用户统计: `https://api.bilibili.com/x/relation/stat`

#### YouTube API
- 视频信息: `https://www.googleapis.com/youtube/v3/videos`
- 频道信息: `https://www.googleapis.com/youtube/v3/channels`

#### Vimeo API
- 视频信息: `https://api.vimeo.com/videos/{videoId}`
- 用户信息: `https://api.vimeo.com/users/{userId}`

### 数据类型
- 所有数值以字符串形式存储
- homepage 使用链接属性类型 (`type: 1, typeArgs: { subType: "link" }`)

## 测试

运行测试脚本以验证功能：

```bash
# 设置环境变量（如果需要）
export YOUTUBE_API_KEY="your_youtube_api_key"
export VIMEO_ACCESS_TOKEN="your_vimeo_access_token"

# 运行测试
npm run test:creator-info
```

## 注意事项

1. **API限制**: 各平台API都有调用限制，请合理使用
2. **错误处理**: 如果无法获取详细信息，插件仍会正常工作，只是不会填充统计字段
3. **数据更新**: 统计信息是静态的，不会自动更新
4. **隐私**: 请确保遵守各平台的使用条款和隐私政策

## 未来改进

- [ ] 支持更多平台（如抖音、快手等）
- [ ] 添加数据更新功能
- [ ] 优化API调用效率
- [ ] 添加更多统计字段
- [ ] 支持自定义字段映射