# Orca 视频信息提取插件

自动提取哔哩哔哩、YouTube 和 Vimeo 视频信息、缩略图、创作者信息等，并设置为 Orca 标签属性。

## 安装

### 方法一：下载发布版本（推荐）

1. 从 [Releases](https://github.com/SaXz2/orca-video-info-extract-plugin/releases) 下载最新版本的 `index.js`
2. 在 Orca 插件目录中创建文件夹 `orca-video-info-extract-plugin`：
   - Windows: `%APPDATA%\Orca\plugins\orca-video-info-extract-plugin\`
   - macOS: `~/Library/Application Support/Orca/plugins/orca-video-info-extract-plugin/`
   - Linux: `~/.config/Orca/plugins/orca-video-info-extract-plugin/`
3. 将下载的 `index.js` 放入该文件夹
4. 重启 Orca 应用
5. 在 设置 > 插件 中启用插件

### 方法二：从源码构建

```bash
# 克隆仓库
git clone https://github.com/SaXz2/orca-video-info-extract-plugin.git
cd orca-video-info-extract-plugin

# 安装依赖
npm install

# 构建插件
npm run build

# 构建产物在 dist/index.js
```

## 功能特性

### 支持的平台

#### 哔哩哔哩
- ✨ 自动识别 B 站视频链接（BV 号/av 号）
- 🖼️ 提取视频封面图片
- 👤 提取 UP 主信息（粉丝数、获赞数、播放量、视频数）
- 🏷️ 提取视频标签
- 📅 提取发布日期
- 🔗 UP 主主页链接

#### YouTube
- ✨ 自动识别 YouTube 视频链接
- 🖼️ 提取视频缩略图
- 👤 提取频道信息（订阅者数、视频数、总播放数）
- 📺 支持多种 YouTube URL 格式（包括 Shorts）
- 🎬 支持视频嵌入
- 🏷️ 提取视频标签（需要 API Key）
- 📅 提取发布日期（需要 API Key）
- 🔗 频道主页链接

#### Vimeo
- ✨ 自动识别 Vimeo 视频链接
- 🖼️ 提取视频缩略图
- 👤 提取作者信息（关注者数、视频数、喜欢数）
- 🏷️ 提取视频标签和分类
- 📅 提取发布日期
- 🔗 作者主页链接

### 通用功能
- ⚙️ 可配置是否插入图片块和视频块
- 📋 右键菜单快捷操作
- 🎯 粘贴链接自动处理
- 🔄 统一的多平台支持
- 🗑️ 清理无引用创作者块功能

## 快速开始

### 第一步：配置插件（可选）

1. 打开 Orca 设置 > 插件 > 视频信息提取插件
2. 根据需要配置：
   - **插入图片块**：是否自动插入封面图片（默认开启）
   - **插入视频块**：是否自动插入视频播放器（默认关闭）
   - **YouTube API Key**：获取 YouTube 完整信息（可选）
   - **Vimeo 访问令牌**：使用 Vimeo 功能（必需）

### 第二步：使用插件

#### 方式一：粘贴链接（最简单）

1. 在 Orca 中创建或选择一个块
2. 直接粘贴视频链接：
   - 哔哩哔哩：`https://www.bilibili.com/video/BV1xx411c7XD`
   - YouTube：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Vimeo：`https://vimeo.com/117125857`
3. 插件会自动识别并提取信息

#### 方式二：右键菜单

1. 在包含视频链接的块上右键点击
2. 选择 "🎬 提取视频信息"

#### 方式三：命令面板

1. 按 `Ctrl+P`（或 `Cmd+P`）打开命令面板
2. 输入并选择：
   - **提取视频信息** - 提取当前块的视频信息
   - **清理无引用创作者块** - 清理所有无引用的 UP主/博主/作者块

### 提取的信息

插件会自动：
- ✅ 提取视频信息和缩略图
- ✅ 添加平台标签（哔哩哔哩/Youtube/Vimeo）
- ✅ 添加创作者标签（哔哩UP/油管博主/Vimeo作者）
- ✅ 设置标签属性（封面、标签、发布日期等）
- ✅ 提取创作者详细信息（粉丝数、主页链接、统计数据等）
- ✅ （可选）插入封面图片和视频块

## 详细使用说明

### 使用场景示例

#### 场景 1：收藏视频笔记

```
在 Orca 中粘贴：https://www.bilibili.com/video/BV1xx411c7XD

自动生成：
- 标签：#哔哩哔哩（包含封面、标签、发布日期）
- 标签：#哔哩UP：某UP主（包含粉丝数、主页链接等）
- 封面图片（如果开启）
```

#### 场景 2：整理视频资源

```
1. 创建一个"视频收藏"页面
2. 粘贴多个视频链接
3. 插件自动提取所有信息
4. 可以通过标签快速筛选和查找
```

#### 场景 3：清理无用创作者

```
1. 打开命令面板（Ctrl+P）
2. 选择"清理无引用创作者块"
3. 自动删除所有没有被引用的 UP主/博主/作者块
```

## 插件设置

在 Orca 设置 > 插件 > 视频信息提取插件 中配置：

### 基础设置

**插入图片块**（默认：开启）
- 开启：在块下方插入封面图片/缩略图
- 关闭：仅将图片 URL 存储在标签属性中

**插入视频块**（默认：关闭）
- 开启：在块下方插入视频块
- 关闭：仅提取信息不插入视频

### API 配置

**YouTube Data API v3 密钥**（可选）
- 用于获取 YouTube 视频真实标签、发布日期和频道详细信息
- 留空则使用基础模式（仅获取缩略图和频道名）
- 申请地址：https://console.developers.google.com/

**Vimeo 访问令牌**（必需，用于 Vimeo 支持）
- 用于获取 Vimeo 视频信息和作者详细信息
- 可在 Vimeo 开发者控制台获取：https://developer.vimeo.com/
- 留空则无法使用 Vimeo 功能

## 标签和属性说明

### 视频平台标签

#### 哔哩哔哩标签
- **img** (文本)：视频封面图片 URL
- **tags** (文本)：视频标签列表，用 `|` 分隔
- **publishDate** (日期)：发布日期
- **publishDateText** (文本)：发布日期文本

#### Youtube 标签
- **img** (文本)：视频缩略图 URL
- **tags** (文本)：视频标签列表，用 `|` 分隔（需要 API Key）
- **publishDate** (日期)：发布日期（需要 API Key）
- **publishDateText** (文本)：发布日期文本（需要 API Key）
- **description** (文本)：视频描述（需要 API Key）

#### Vimeo 标签
- **img** (文本)：视频缩略图 URL
- **tags** (文本)：视频标签列表，用 `|` 分隔
  - 用户标签带 `#` 前缀（如 `#tutorial`）
  - 分类标签无前缀（如 `Music`）
- **publishDate** (日期)：发布日期
- **publishDateText** (文本)：发布日期文本

### 创作者标签

#### 哔哩UP 标签
格式：`哔哩UP：{UP主名称}`

#### 油管博主标签
格式：`油管博主：{频道名称}`

#### Vimeo作者标签
格式：`Vimeo作者：{作者名称}`

### 视频创作者标签

所有创作者标签都会自动添加"视频创作者"标签，包含以下属性：

- **followerCount** (文本)：粉丝数/订阅者数/关注者数
- **homepage** (链接)：创作者主页链接
- **likeCount** (文本)：获赞数/喜欢数
- **playCount** (文本)：播放量/总播放数
- **videoCount** (文本)：视频数量

> 注意：不同平台支持的属性字段可能有所不同，未获取到的字段将为空。

## 支持的 URL 格式

### 哔哩哔哩
- `https://www.bilibili.com/video/BV1xx411c7XD`
- `https://www.bilibili.com/video/av12345`
- `https://bilibili.com/video/BV1xx411c7XD`

### YouTube
- `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- `https://youtu.be/dQw4w9WgXcQ`
- `https://youtube.com/watch?v=dQw4w9WgXcQ`
- `https://www.youtube.com/shorts/_Ex--OvqMok`

### Vimeo
- `https://vimeo.com/117125857`
- `https://www.vimeo.com/117125857`

## 技术架构

### 模块化设计

- **src/main.ts** - 插件入口和生命周期管理
- **src/video-processor.ts** - 统一视频处理接口
- **src/bilibili.ts** - 哔哩哔哩功能模块
- **src/youtube.ts** - YouTube 功能模块
- **src/vimeo.ts** - Vimeo 功能模块
- **src/cleanup-creators.ts** - 清理无引用创作者块模块

### API 使用

#### 哔哩哔哩 API
- 视频信息：`https://api.bilibili.com/x/web-interface/view`
- 视频标签：`https://api.bilibili.com/x/tag/archive/tags`
- 用户信息：`https://api.bilibili.com/x/web-interface/card`
- 用户统计：`https://api.bilibili.com/x/relation/stat`

#### YouTube API
- 视频信息：`https://www.googleapis.com/youtube/v3/videos`
- 频道信息：`https://www.googleapis.com/youtube/v3/channels`
- oEmbed API（基础模式）：`https://www.youtube.com/oembed`

#### Vimeo API
- 视频信息：`https://api.vimeo.com/videos/{videoId}`
- 用户信息：`https://api.vimeo.com/users/{userId}`
- oEmbed API：`https://vimeo.com/api/oembed.json`

### 单元测试

项目包含完整的单元测试覆盖：
- ✅ 哔哩哔哩功能测试
- ✅ YouTube 功能测试
- ✅ Vimeo 功能测试
- ✅ 统一处理器测试
- ✅ 错误处理测试

运行测试：
```bash
npm run test          # 运行所有测试
npm run test:watch    # 监听模式
npm run test:coverage # 生成覆盖率报告
```

## 注意事项

1. **API 限制**：各平台 API 都有调用限制，请合理使用
2. **错误处理**：如果无法获取详细信息，插件仍会正常工作，只是不会填充统计字段
3. **数据更新**：统计信息是静态的，不会自动更新
4. **隐私**：请确保遵守各平台的使用条款和隐私政策
5. **YouTube API**：需要配置 API Key 才能获取完整的视频标签、发布日期和频道详细信息
6. **Vimeo API**：必须配置访问令牌才能使用 Vimeo 功能

## 许可证

MIT License

## 作者

SaXz2

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### v1.2.0
- ✨ 新增清理无引用创作者块功能
- 🗑️ 支持一键清理所有无引用的 UP主/博主/作者块
- 📊 清理过程提供详细的日志记录和统计信息
- 🔧 优化代码结构和模块化设计

### v1.1.1
- 🎨 新增链接样式优化功能
- ✨ 支持链接文本截断显示和悬浮提示
- 🔧 可配置的链接样式优化开关
- 🌐 全面覆盖动态加载的链接
- 🖱️ 智能悬浮提示显示链接文本内容
- 📱 响应式链接样式适配

### v1.1.0
- 🔧 改进插件功能和稳定性
- 🐛 修复 UP 主信息提取和标签功能
- 📦 优化插件打包结构
- 🚀 完善 GitHub Actions 发布流程
- 📝 增强文档和 README 说明
- ⚡ 提升 API 调用性能和错误处理

### v1.0.0
- ✨ 初始版本
- 支持提取视频封面、UP 主、标签
- 支持标签属性存储
- 可配置图片插入选项
- 完整的单元测试覆盖
