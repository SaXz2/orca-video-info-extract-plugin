/**
 * 视频信息提取插件
 * 支持哔哩哔哩、YouTube 和 Vimeo 视频链接，自动提取视频信息、缩略图、频道信息等
 */

import { initializeBilibiliTag, initializeVideoCreatorTag } from './bilibili';
import { initializeYouTubeTag } from './youtube';
import { initializeVimeoTag } from './vimeo';
import { processVideoLink, hasVideoLink, createPasteHandler } from './video-processor';
import { cleanupUnusedCreatorBlocks } from './cleanup-creators';







let pasteHandler: ((event: ClipboardEvent) => void) | null = null;
let pluginNameStorage: string | null = null;

/**
 * 插件加载函数
 * @param pluginName 插件名称
 */
export async function load(pluginName: string) {
  pluginNameStorage = pluginName;
  
  // 初始化标签
  await Promise.all([
    initializeBilibiliTag(),
    initializeVideoCreatorTag(),
    initializeYouTubeTag(),
    initializeVimeoTag()
  ]);
  
  // 注册插件设置
  await orca.plugins.setSettingsSchema(pluginName, {
    insertImageBlock: {
      label: '插入图片块',
      description: '是否在块中插入封面图片（图片URL会始终存储在标签属性中）',
      type: 'boolean',
      defaultValue: true
    },
    insertVideoBlock: {
      label: '插入视频块',
      description: '是否在块中插入视频块（使用视频链接作为视频源）',
      type: 'boolean',
      defaultValue: false
    },
    youtubeApiKey: {
      label: 'YouTube Data API v3 密钥',
      description: '用于获取 YouTube 视频真实标签和发布日期的 API 密钥（可选，留空则使用基础模式）',
      type: 'string',
      defaultValue: ''
    },
    vimeoAccessToken: {
      label: 'Vimeo 访问令牌',
      description: '用于获取 Vimeo 视频信息的访问令牌（必需，可在 Vimeo 开发者控制台获取）',
      type: 'string',
      defaultValue: ''
    },
  });
  
  // 编辑器命令
  orca.commands.registerEditorCommand(
    `${pluginName}.extractVideoInfo`,
    async (cursor) => {
      try {
        const blockId = (cursor as any)?.anchor?.blockId;
        if (blockId) {
          await processVideoLink(blockId, pluginName);
        }
      } catch (error) {
        console.error('编辑器命令执行失败:', error);
      }
      return null;
    },
    () => {},
    { label: '提取视频信息' }
  );

  // 清理无引用创作者块命令
  orca.commands.registerEditorCommand(
    `${pluginName}.cleanupUnusedCreatorBlocks`,
    async () => {
      try {
        orca.notify('info', '正在清理无引用的创作者块...');
        const result = await cleanupUnusedCreatorBlocks();
        
        if (result.deletedBlockIds.length === 0) {
          orca.notify('success', '没有需要清理的创作者块');
        } else {
          orca.notify(
            'success', 
            `已清理 ${result.statistics.deleted} 个无引用的创作者块`
          );
        }
      } catch (error) {
        console.error('清理创作者块失败:', error);
        orca.notify('error', '清理失败，请查看控制台日志');
      }
      return null;
    },
    () => {},
    { label: '清理无引用创作者块' }
  );
  
  // 右键菜单
  orca.blockMenuCommands.registerBlockMenuCommand(`${pluginName}.extractVideoInfo`, {
    worksOnMultipleBlocks: false,
    render: (blockId, _rootBlockId, close) => {
      const { React } = window;
      const { MenuText } = orca.components;
      
      const block = orca.state.blocks[blockId] as any;
      if (!block || !hasVideoLink(block)) return null;
      
      return React.createElement(MenuText, {
        title: '🎬 提取视频信息',
        preIcon: 'ti ti-video',
        onClick: () => {
          close();
          processVideoLink(blockId, pluginName);
        }
      });
    }
  });
  
  // 粘贴监听
  pasteHandler = createPasteHandler(pluginName);
  document.addEventListener('paste', pasteHandler);
  
  orca.notify('info', '视频信息提取插件已启用');
}

/**
 * 插件卸载函数
 */
export async function unload() {
  if (pasteHandler) {
    document.removeEventListener('paste', pasteHandler);
    pasteHandler = null;
  }
  
  if (pluginNameStorage) {
    // 注销清理命令
    orca.commands.unregisterCommand(`${pluginNameStorage}.cleanupUnusedCreatorBlocks`);
  }
  
  pluginNameStorage = null;
}