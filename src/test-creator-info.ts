/**
 * 测试视频创作者信息提取功能
 * 这个文件用于测试新添加的创作者详细信息提取功能
 */

import { getCompleteVideoInfo, getUserInfo, extractVideoId } from './bilibili';
import { getYouTubeVideoDetails, getYouTubeChannelInfo } from './youtube';
import { getVimeoVideoInfo, getVimeoUserInfo } from './vimeo';

// 测试B站视频链接
async function testBilibili() {
  console.log('🧪 测试B站视频信息提取...');

  const testUrl = 'https://www.bilibili.com/video/BV1GJ411x7h7';
  const videoId = extractVideoId(testUrl);

  if (videoId) {
    try {
      const videoInfo = await getCompleteVideoInfo(videoId);
      console.log('✅ 视频信息:', videoInfo);

      if (videoInfo.upMid) {
        const userInfo = await getUserInfo(videoInfo.upMid);
        console.log('✅ UP主详细信息:', userInfo);
      }
    } catch (error) {
      console.error('❌ B站测试失败:', error);
    }
  }
}

// 测试YouTube视频链接
async function testYouTube() {
  console.log('🧪 测试YouTube视频信息提取...');

  // 需要API Key才能测试
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    console.log('⚠️ 未设置YouTube API Key，跳过YouTube测试');
    return;
  }

  const videoId = 'dQw4w9WgXcQ'; // Rick Roll video ID

  try {
    const videoInfo = await getYouTubeVideoDetails(videoId, apiKey);
    console.log('✅ 视频信息:', videoInfo);

    if (videoInfo.channelId) {
      const channelInfo = await getYouTubeChannelInfo(videoInfo.channelId, apiKey);
      console.log('✅ 频道详细信息:', channelInfo);
    }
  } catch (error) {
    console.error('❌ YouTube测试失败:', error);
  }
}

// 测试Vimeo视频链接
async function testVimeo() {
  console.log('🧪 测试Vimeo视频信息提取...');

  // 需要Access Token才能测试
  const accessToken = process.env.VIMEO_ACCESS_TOKEN;
  if (!accessToken) {
    console.log('⚠️ 未设置Vimeo Access Token，跳过Vimeo测试');
    return;
  }

  const videoId = '148751763'; // 示例Vimeo视频ID

  try {
    const videoInfo = await getVimeoVideoInfo(videoId, accessToken);
    console.log('✅ 视频信息:', videoInfo);

    if (videoInfo.authorId) {
      const userInfo = await getVimeoUserInfo(videoInfo.authorId, accessToken);
      console.log('✅ 用户详细信息:', userInfo);
    }
  } catch (error) {
    console.error('❌ Vimeo测试失败:', error);
  }
}

// 运行所有测试
async function runTests() {
  console.log('🚀 开始测试视频创作者信息提取功能...\n');

  await testBilibili();
  console.log('');

  await testYouTube();
  console.log('');

  await testVimeo();
  console.log('');

  console.log('✨ 测试完成！');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTests().catch(console.error);
}

export { testBilibili, testYouTube, testVimeo, runTests };