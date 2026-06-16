import { NextResponse } from 'next/server';
import youtubesearchapi from 'youtube-search-api';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    // Get search results directly from YouTube
    const results = await youtubesearchapi.GetListByKeyword(`${q} audio`, false, 20);
    
    // Map the direct YouTube results to our app format
    const formattedResults = results.items
      .filter(item => item.type === 'video')
      .map(item => ({
        id: item.id,
        name: item.title,
        artist: item.channelTitle,
        album: "YouTube Audio",
        imageUrl: item.thumbnail.thumbnails && item.thumbnail.thumbnails.length > 0 
          ? item.thumbnail.thumbnails[0].url 
          : 'https://via.placeholder.com/150',
        duration: item.length?.simpleText || '0:00', // e.g. "3:45"
        youtubeUrl: `https://www.youtube.com/watch?v=${item.id}`
      }));

    return NextResponse.json({ items: formattedResults });
  } catch (error) {
    console.error('API Route Search Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}
