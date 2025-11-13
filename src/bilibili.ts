/**
 * 哔哩哔哩视频信息提取模块
 * 自动检测哔哩哔哩链接并提取封面图片、UP主信息、标签等
 */

const BILIBILI_URL_REGEX = /https?:\/\/(?:www\.)?bilibili\.com\/video\/(?:BV|av)\w+/i;

const API_CONFIG = {
  videoInfo: 'https://api.bilibili.com/x/web-interface/view',
  videoTags: 'https://api.bilibili.com/x/tag/archive/tags',
  userInfo: 'https://api.bilibili.com/x/web-interface/card',
  userStat: 'https://api.bilibili.com/x/relation/stat',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://www.bilibili.com/'
  }
} as const;

interface Block {
  id: number;
  content?: Array<{
    t: string;
    v?: string;
    l?: string;
  }>;
}

export interface BilibiliVideoInfo {
  coverUrl: string | null;
  upName: string | null;
  upMid: string | null;
  title: string | null;
  tags: string[];
  publishDate: string | null;
}

export interface BilibiliUserInfo {
  followerCount: number | null;
  homepage: string | null;
  likeCount: number | null;
  playCount: number | null;
  videoCount: number | null;
}

/**
 * 从URL中提取视频ID
 * @param url B站视频URL
 * @returns 视频ID（BV号或av号），失败返回null
 */
export function extractVideoId(url: string): string | null {
  const match = url.match(/\/video\/(BV\w+|av\d+)/i);
  return match ? match[1] : null;
}

/**
 * 检查块是否包含B站链接
 * @param block 块对象
 * @returns 是否包含B站链接
 */
export function hasBilibiliLink(block: Block): boolean {
  if (!block?.content) return false;
  
  for (const fragment of block.content) {
    if (fragment.t === 'l' && fragment.l && BILIBILI_URL_REGEX.test(fragment.l)) {
      return true;
    }
  }
  
  const text = block.content.map(f => f.v || '').join('');
  return BILIBILI_URL_REGEX.test(text);
}

/**
 * 从块内容中提取B站链接
 * @param block 块对象
 * @returns B站视频URL，未找到返回null
 */
export function extractBilibiliUrl(block: Block): string | null {
  if (!block?.content) return null;
  
  // 优先从链接fragment中提取
  for (const fragment of block.content) {
    if (fragment.t === 'l' && fragment.l && BILIBILI_URL_REGEX.test(fragment.l)) {
      return fragment.l;
    }
  }
  
  // 从文本中提取
  const text = block.content.map(f => f.v || '').join('');
  const match = text.match(BILIBILI_URL_REGEX);
  return match ? match[0] : null;
}

/**
 * 获取视频基本信息
 * @param videoId 视频ID（BV号或av号）
 * @returns 视频信息对象
 */
export async function getVideoInfo(videoId: string): Promise<BilibiliVideoInfo> {
  try {
    const url = `${API_CONFIG.videoInfo}?bvid=${videoId}`;
    const response = await fetch(url, { headers: API_CONFIG.headers });
    
    if (!response.ok) {
      return { coverUrl: null, upName: null, title: null, tags: [], publishDate: null };
    }
    
    const data = await response.json();
    if (data.code === 0 && data.data) {
      const video = data.data;
      
      // 调试：打印原始数据
      console.log('🔍 API 返回的原始数据:', {
        pubdate: video.pubdate,
        ctime: video.ctime,
        pub_time: video.pub_time
      });
      
      // 转换时间戳为日期字符串
      let publishDate: string | null = null;
      if (video.pubdate) {
        const date = new Date(video.pubdate * 1000); // 时间戳转换为毫秒
        publishDate = date.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
        console.log('📅 转换后的发布日期:', publishDate);
      } else {
        console.log('⚠️ 未找到 pubdate 字段');
      }
      
      return {
        coverUrl: video.pic || null,
        upName: video.owner?.name || null,
        upMid: video.owner?.mid?.toString() || null,
        title: video.title || null,
        tags: [], // 标签通过单独的API获取
        publishDate
      };
    }
    
    return { coverUrl: null, upName: null, title: null, tags: [], publishDate: null };
  } catch (error) {
    console.error('获取视频信息失败:', error);
    return { coverUrl: null, upName: null, title: null, tags: [], publishDate: null };
  }
}

/**
 * 获取视频标签列表
 * @param videoId 视频ID（BV号或av号）
 * @returns 标签名称数组
 */
export async function getVideoTags(videoId: string): Promise<string[]> {
  try {
    const url = `${API_CONFIG.videoTags}?bvid=${videoId}`;
    const response = await fetch(url, { headers: API_CONFIG.headers });
    
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    if (data.code === 0 && Array.isArray(data.data)) {
      return data.data
        .map((tag: any) => tag.tag_name || '')
        .filter((name: string) => name.trim().length > 0);
    }
    
    return [];
  } catch (error) {
    console.error('获取视频标签失败:', error);
    return [];
  }
}

/**
 * 获取UP主详细信息
 * @param mid UP主的mid
 * @returns UP主详细信息
 */
export async function getUserInfo(mid: string): Promise<BilibiliUserInfo> {
  try {
    console.log('🔍 开始获取UP主详细信息，mid:', mid);

    // 并行获取用户信息和统计信息
    const [cardResponse, statResponse] = await Promise.all([
      fetch(`${API_CONFIG.userInfo}?mid=${mid}`, { headers: API_CONFIG.headers }),
      fetch(`${API_CONFIG.userStat}?vmid=${mid}`, { headers: API_CONFIG.headers })
    ]);

    console.log('📡 API响应状态 - 卡片信息:', cardResponse.status, '统计信息:', statResponse.status);

    const defaultResult: BilibiliUserInfo = {
      followerCount: null,
      homepage: null,
      likeCount: null,
      playCount: null,
      videoCount: null
    };

    if (!cardResponse.ok || !statResponse.ok) {
      console.log('❌ API请求失败');
      return defaultResult;
    }

    const cardData = await cardResponse.json();
    const statData = await statResponse.json();

    console.log('📊 API返回数据 - 卡片:', cardData, '统计:', statData);
    console.log('📊 详细卡片数据结构:', JSON.stringify(cardData, null, 2));
    console.log('📊 详细统计数据结构:', JSON.stringify(statData, null, 2));

    if (cardData.code !== 0 || statData.code !== 0) {
      console.log('❌ API返回错误码 - 卡片:', cardData.code, '统计:', statData.code);
      return defaultResult;
    }

    const card = cardData.data?.card;
    const stat = statData.data;

    console.log('📋 解析后的数据 - 卡片:', card, '统计:', stat);

    const result = {
      followerCount: stat?.follower || null,
      homepage: card?.mid ? `https://space.bilibili.com/${card.mid}` : null,
      likeCount: card?.like_num || cardData.data?.like_num || null,
      playCount: card?.view || null,
      videoCount: card?.arc_num || cardData.data?.archive_count || null
    };

    console.log('🔍 调试数据解析:');
    console.log('- stat.follower:', stat?.follower);
    console.log('- card.like_num:', card?.like_num);
    console.log('- cardData.data.like_num:', cardData.data?.like_num);
    console.log('- cardData.data.archive_count:', cardData.data?.archive_count);
    console.log('- card.arc_num:', card?.arc_num);
    console.log('- card.view (播放量):', card?.view);
    console.log('- 检查card对象中的所有可能的播放量字段:', Object.keys(card || {}));

    // 检查card对象中是否包含播放量相关的字段
    if (card) {
      console.log('- card对象详细内容:', card);
      // 常见的播放量字段名
      const possiblePlayCountFields = ['view', 'play', 'total_view', 'total_play', 'view_count', 'play_count'];
      possiblePlayCountFields.forEach(field => {
        if (card[field] !== undefined) {
          console.log(`- 找到可能的播放量字段 ${field}:`, card[field]);
        }
      });
    }

    console.log('✅ 最终UP主信息结果:', result);
    return result;
  } catch (error) {
    console.error('❌ 获取UP主信息失败:', error);
    return {
      followerCount: null,
      homepage: null,
      likeCount: null,
      playCount: null,
      videoCount: null
    };
  }
}

/**
 * 获取完整的视频信息（包括标签）
 * @param videoId 视频ID（BV号或av号）
 * @returns 完整的视频信息
 */
export async function getCompleteVideoInfo(videoId: string): Promise<BilibiliVideoInfo> {
  const [info, tags] = await Promise.all([
    getVideoInfo(videoId),
    getVideoTags(videoId)
  ]);

  return {
    ...info,
    tags
  };
}

/**
 * 处理B站链接，提取视频信息并设置标签
 * @param blockId 块ID
 * @param pluginName 插件名称
 */
export async function processBilibiliLink(blockId: number, pluginName: string): Promise<void> {
  try {
    const block = orca.state.blocks[blockId] as Block;
    if (!block?.content) return;
    
    // 提取B站链接
    const bilibiliUrl = extractBilibiliUrl(block);
    if (!bilibiliUrl) return;
    
    const videoId = extractVideoId(bilibiliUrl);
    if (!videoId) return;
    
    orca.notify('info', '正在获取视频信息...');
    
    // 并行获取视频信息和标签
    const videoInfo = await getCompleteVideoInfo(videoId);
    
    if (!videoInfo.coverUrl) {
      orca.notify('error', '获取视频信息失败');
      return;
    }
    
    // 获取插件设置
    const settings = orca.state.plugins[pluginName]?.settings as any;
    const shouldInsertImage = settings?.insertImageBlock !== false;
    const shouldInsertVideo = settings?.insertVideoBlock === true;
    
    // 添加哔哩哔哩标签
    const tagsString = videoInfo.tags.join('|');
    
    // 先插入标签
    await orca.commands.invokeEditorCommand(
      "core.editor.insertTag",
      null,
      blockId,
      '哔哩哔哩'
    );
    
    // 重新获取块以获得最新的标签引用
    const updatedBlock = orca.state.blocks[blockId];
    const tagRef = updatedBlock?.refs?.find(
      (ref: any) => ref.type === 2 && ref.alias === '哔哩哔哩'
    );
    
    if (tagRef) {
      await orca.commands.invokeEditorCommand(
        "core.editor.setRefData",
        null,
        tagRef,
        [
          { name: "img", value: videoInfo.coverUrl, type: 1 },
          { name: "tags", value: tagsString, type: 1 },
          { name: "publishDate", value: videoInfo.publishDate ? new Date(videoInfo.publishDate) : new Date(), type: 5 },
          { name: "publishDateText", value: videoInfo.publishDate || "", type: 1 }
        ]
      );
    }
    
    // 根据设置决定是否插入图片块
    if (shouldInsertImage) {
      await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        block,
        "lastChild",
        null,
        { type: "image", src: videoInfo.coverUrl, alt: "哔哩哔哩视频封面" }
      );
    }
    
    // 根据设置决定是否插入视频块
    if (shouldInsertVideo) {
      await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        block,
        "lastChild",
        null,
        { type: "video", src: bilibiliUrl, title: videoInfo.title || "哔哩哔哩视频" }
      );
    }
    
    // 添加UP主标签
    if (videoInfo.upName && videoInfo.upMid) {
      const upTagId = await orca.commands.invokeEditorCommand(
        "core.editor.insertTag",
        null,
        blockId,
        `哔哩UP：${videoInfo.upName}`
      );

      // 为UP主标签别名块添加"视频创作者"标签
      if (upTagId) {
        const videoCreatorTagId = await orca.commands.invokeEditorCommand(
          "core.editor.insertTag",
          null,
          upTagId,
          "视频创作者"
        );

        // 获取UP主详细信息
        try {
          console.log('🔍 开始获取UP主详细信息，UP主mid:', videoInfo.upMid);
          const userInfo = await getUserInfo(videoInfo.upMid);
          console.log('📊 获取到的UP主信息:', userInfo);

          // 为"视频创作者"标签别名块设置详细属性
          if (videoCreatorTagId) {
            console.log('🏷️ 视频创作者标签ID:', videoCreatorTagId);

            // 从UP主标签块中找到指向"视频创作者"标签的引用
            const upBlock = orca.state.blocks[upTagId];
            console.log('👤 UP主标签块:', upBlock);
            console.log('👤 UP主标签块的refs:', upBlock?.refs);

            const creatorTagRef = upBlock?.refs?.find(
              (ref: any) => ref.to === videoCreatorTagId && ref.alias === "视频创作者"
            );
            console.log('🔗 找到的视频创作者标签引用:', creatorTagRef);

            if (creatorTagRef) {
              const refData = [];

              // 添加粉丝数
              if (userInfo.followerCount !== null) {
                console.log('👥 添加粉丝数:', userInfo.followerCount);
                refData.push({
                  name: "followerCount",
                  value: userInfo.followerCount.toString(),
                  type: 1
                });
              }

              // 添加主页链接（使用链接属性类型）
              if (userInfo.homepage) {
                console.log('🌐 添加主页链接:', userInfo.homepage);
                refData.push({
                  name: "homepage",
                  value: userInfo.homepage,
                  type: 1,
                  typeArgs: { subType: "link" }
                });
              }

              // 添加获赞数
              if (userInfo.likeCount !== null) {
                console.log('👍 添加获赞数:', userInfo.likeCount);
                refData.push({
                  name: "likeCount",
                  value: userInfo.likeCount.toString(),
                  type: 1
                });
              }

              // 添加播放数
              if (userInfo.playCount !== null) {
                console.log('▶️ 添加播放数:', userInfo.playCount);
                refData.push({
                  name: "playCount",
                  value: userInfo.playCount.toString(),
                  type: 1
                });
              }

              // 添加视频数
              if (userInfo.videoCount !== null) {
                console.log('🎬 添加视频数:', userInfo.videoCount);
                refData.push({
                  name: "videoCount",
                  value: userInfo.videoCount.toString(),
                  type: 1
                });
              }

              console.log('📝 准备写入的属性数据:', refData);

              if (refData.length > 0) {
                console.log('💾 开始写入属性...');
                await orca.commands.invokeEditorCommand(
                  "core.editor.setRefData",
                  null,
                  creatorTagRef,
                  refData
                );
                console.log('✅ 属性写入完成');
              } else {
                console.log('⚠️ 没有有效的属性数据可写入');
              }
            } else {
              console.log('❌ 未找到视频创作者标签引用');
            }
          } else {
            console.log('❌ 视频创作者标签创建失败');
          }
        } catch (error) {
          console.error('❌ 获取UP主详细信息失败:', error);
        }
      }
    }
    
    // 成功通知
    const messages = ['成功提取视频信息'];
    if (videoInfo.upName) messages.push(`UP主：${videoInfo.upName}`);
    if (videoInfo.tags.length > 0) messages.push(`标签数：${videoInfo.tags.length}`);
    
    orca.notify('success', messages.join(' | '));
    
  } catch (error) {
    console.error('处理B站链接失败:', error);
    orca.notify('error', '处理失败');
  }
}

/**
 * 初始化"哔哩哔哩"标签块及其属性
 */
export async function initializeBilibiliTag(): Promise<void> {
  try {
    const result = await orca.invokeBackend('get-blockid-by-alias', '哔哩哔哩');
    let tagBlockId: number;

    if (result?.id != null) {
      tagBlockId = result.id;
    } else {
      tagBlockId = await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        null,
        null,
        [{ t: "t", v: "哔哩哔哩" }],
        { type: "text" }
      );
    }

    // 为标签块设置属性（如果不存在则创建）
    await orca.commands.invokeEditorCommand(
      "core.editor.setProperties",
      null,
      [tagBlockId],
      [
        {
          name: "img",
          value: "",
          type: 1,  // PropType.Text
          typeArgs: { subType: "image" }
        },
        {
          name: "tags",
          value: "",
          type: 1  // PropType.Text
        },
        {
          name: "publishDate",
          value: new Date(),
          type: 5,  // PropType.DateTime
          typeArgs: { subType: "date" }
        },
        {
          name: "publishDateText",
          value: "",
          type: 1  // PropType.Text
        }
      ]
    );
  } catch (error) {
    // 静默处理错误
    console.error('初始化哔哩哔哩标签失败:', error);
  }
}

/**
 * 初始化"视频创作者"标签块及其属性
 */
export async function initializeVideoCreatorTag(): Promise<void> {
  try {
    const result = await orca.invokeBackend('get-blockid-by-alias', '视频创作者');
    let tagBlockId: number;

    if (result?.id != null) {
      tagBlockId = result.id;
    } else {
      tagBlockId = await orca.commands.invokeEditorCommand(
        "core.editor.insertBlock",
        null,
        null,
        null,
        [{ t: "t", v: "视频创作者" }],
        { type: "text" }
      );
    }

    // 为标签块设置属性（如果不存在则创建）
    await orca.commands.invokeEditorCommand(
      "core.editor.setProperties",
      null,
      [tagBlockId],
      [
        {
          name: "followerCount",
          value: "",
          type: 1  // PropType.Text
        },
        {
          name: "homepage",
          value: "",
          type: 1,  // PropType.Text
          typeArgs: { subType: "link" }
        },
        {
          name: "likeCount",
          value: "",
          type: 1  // PropType.Text
        },
        {
          name: "playCount",
          value: "",
          type: 1  // PropType.Text
        },
        {
          name: "videoCount",
          value: "",
          type: 1  // PropType.Text
        }
      ]
    );
  } catch (error) {
    // 静默处理错误
    console.error('初始化视频创作者标签失败:', error);
  }
}
