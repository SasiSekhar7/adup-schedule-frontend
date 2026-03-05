export type StreamProvider = {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  website: string;
  features: string[];
  channels: Channel[];
};

export type Channel = {
  id: string;
  name: string;
  status: "active" | "inactive" | "live";
  type: "streaming" | "website" | "vod";
  duration: string;
  url: string;
  rtmpUrl: string;
  streamKey: string;
  createdAt: string;
  resolution: string;
  bitrate: string;
  fps: string;
  viewers: number;
  config: string;
};

export const streamProviders: StreamProvider[] = [
  {
    id: "dacast",
    name: "Dacast",
    slug: "dacast",
    description:
      "Professional live streaming and video hosting platform with monetization features, multi-CDN delivery, and real-time analytics.",
    logo: "D",
    website: "https://www.dacast.com",
    features: [
      "Multi-CDN Delivery",
      "Real-time Analytics",
      "Monetization Tools",
      "Video on Demand",
      "24/7 Live Streaming",
      "China Delivery",
    ],
    channels: [
      {
        id: "ch-001",
        name: "pvs",
        status: "live",
        type: "streaming",
        duration: "Indefinite",
        url: "https://playlist.dacast.com/live/c62ada25-f979-6a3b-live.m3u8",
        rtmpUrl: "rtmp://ingest.dacast.com/live",
        streamKey: "c62ada25-f979-6a3b-4d82-stream_pvs_key",
        createdAt: "3/2/2026",
        resolution: "1920x1080",
        bitrate: "4500 kbps",
        fps: "30",
        viewers: 142,
        config: "HD Profile",
      },
      {
        id: "ch-002",
        name: "dacast live",
        status: "live",
        type: "streaming",
        duration: "Indefinite",
        url: "https://playlist.dacast.com/live/c62ada25-f979-6b2c-live.m3u8",
        rtmpUrl: "rtmp://ingest.dacast.com/live",
        streamKey: "c62ada25-f979-6b2c-8e91-stream_dacast_key",
        createdAt: "3/2/2026",
        resolution: "1920x1080",
        bitrate: "6000 kbps",
        fps: "60",
        viewers: 328,
        config: "Ultra HD Profile",
      },
      {
        id: "ch-003",
        name: "live news",
        status: "active",
        type: "streaming",
        duration: "3m 20s",
        url: "https://pl-indiatvnews.akamaized.net/out/v1/db79a1e8.m3u8",
        rtmpUrl: "rtmp://ingest.dacast.com/live",
        streamKey: "db79a1e8-v1-out-news-stream_live_key",
        createdAt: "3/2/2026",
        resolution: "1280x720",
        bitrate: "3000 kbps",
        fps: "30",
        viewers: 56,
        config: "Standard Profile",
      },
      {
        id: "ch-004",
        name: "test 0",
        status: "active",
        type: "website",
        duration: "Indefinite",
        url: "https://dmer.maharashtra.gov.in/english/public-dashboard",
        rtmpUrl: "rtmp://ingest.dacast.com/live",
        streamKey: "test0-a1b2c3d4-stream_test_key",
        createdAt: "3/2/2026",
        resolution: "1280x720",
        bitrate: "2500 kbps",
        fps: "30",
        viewers: 12,
        config: "Low Latency",
      },
      {
        id: "ch-005",
        name: "demo",
        status: "active",
        type: "website",
        duration: "1m 59s",
        url: "https://www.tableau.com/dashboard/what-is-dashboard",
        rtmpUrl: "rtmp://ingest.dacast.com/live",
        streamKey: "demo-e5f6g7h8-stream_demo_key",
        createdAt: "3/2/2026",
        resolution: "1920x1080",
        bitrate: "4500 kbps",
        fps: "30",
        viewers: 0,
        config: "Standard Profile",
      },
    ],
  },
  {
    id: "vimeo-livestream",
    name: "Vimeo Livestream",
    slug: "vimeo-livestream",
    description:
      "Enterprise-grade live streaming with premium video quality, privacy controls, and built-in audience engagement tools.",
    logo: "V",
    website: "https://www.vimeo.com/features/livestreaming",
    features: [
      "HD Streaming",
      "Audience Analytics",
      "Custom Branding",
      "Simulcasting",
      "Cloud Transcoding",
      "Privacy Controls",
    ],
    channels: [
      {
        id: "vm-001",
        name: "Corporate Webinar",
        status: "active",
        type: "streaming",
        duration: "Indefinite",
        url: "https://vimeo.com/event/corp-webinar-2026",
        rtmpUrl: "rtmp://rtmp-global.vimeo.com/live",
        streamKey: "vimeo-corp-webinar-a1b2c3d4e5",
        createdAt: "2/15/2026",
        resolution: "1920x1080",
        bitrate: "5000 kbps",
        fps: "30",
        viewers: 89,
        config: "Business Pro",
      },
      {
        id: "vm-002",
        name: "Product Launch",
        status: "live",
        type: "streaming",
        duration: "45m 12s",
        url: "https://vimeo.com/event/product-launch-2026",
        rtmpUrl: "rtmp://rtmp-global.vimeo.com/live",
        streamKey: "vimeo-product-launch-f6g7h8i9j0",
        createdAt: "3/1/2026",
        resolution: "1920x1080",
        bitrate: "6000 kbps",
        fps: "60",
        viewers: 1240,
        config: "Premium HD",
      },
    ],
  },
  {
    id: "wowza",
    name: "Wowza Streaming Cloud",
    slug: "wowza",
    description:
      "Scalable cloud-based streaming with low latency, adaptive bitrate, and robust API for custom integrations.",
    logo: "W",
    website: "https://www.wowza.com",
    features: [
      "Ultra Low Latency",
      "Adaptive Bitrate",
      "REST API",
      "Multi-protocol Support",
      "Global CDN",
      "Transcoding Engine",
    ],
    channels: [
      {
        id: "wz-001",
        name: "Sports Live",
        status: "live",
        type: "streaming",
        duration: "2h 15m",
        url: "https://cdn.wowza.com/live/sports-2026.m3u8",
        rtmpUrl: "rtmp://entry.wowza.com/app/live",
        streamKey: "wowza-sports-k1l2m3n4o5",
        createdAt: "2/28/2026",
        resolution: "1920x1080",
        bitrate: "8000 kbps",
        fps: "60",
        viewers: 5420,
        config: "Ultra Low Latency",
      },
      {
        id: "wz-002",
        name: "Conference Room A",
        status: "active",
        type: "streaming",
        duration: "Indefinite",
        url: "https://cdn.wowza.com/live/conf-room-a.m3u8",
        rtmpUrl: "rtmp://entry.wowza.com/app/live",
        streamKey: "wowza-conf-p6q7r8s9t0",
        createdAt: "3/1/2026",
        resolution: "1280x720",
        bitrate: "3500 kbps",
        fps: "30",
        viewers: 34,
        config: "Standard",
      },
      {
        id: "wz-003",
        name: "Training Stream",
        status: "inactive",
        type: "vod",
        duration: "1h 30m",
        url: "https://cdn.wowza.com/vod/training-stream.m3u8",
        rtmpUrl: "rtmp://entry.wowza.com/app/live",
        streamKey: "wowza-train-u1v2w3x4y5",
        createdAt: "2/20/2026",
        resolution: "1280x720",
        bitrate: "2500 kbps",
        fps: "30",
        viewers: 0,
        config: "Standard",
      },
    ],
  },
  {
    id: "restream",
    name: "Restream",
    slug: "restream",
    description:
      "Multistreaming platform that lets you broadcast to 30+ social platforms simultaneously with real-time chat aggregation.",
    logo: "R",
    website: "https://restream.io",
    features: [
      "30+ Platform Simulcast",
      "Chat Aggregation",
      "Stream Scheduling",
      "Custom RTMP",
      "Analytics Dashboard",
      "Brand Overlays",
    ],
    channels: [
      {
        id: "rs-001",
        name: "Multi-Platform Show",
        status: "live",
        type: "streaming",
        duration: "1h 45m",
        url: "https://app.restream.io/channel/multi-show",
        rtmpUrl: "rtmp://live.restream.io/live",
        streamKey: "restream-multi-z6a7b8c9d0",
        createdAt: "3/1/2026",
        resolution: "1920x1080",
        bitrate: "6000 kbps",
        fps: "30",
        viewers: 2780,
        config: "Multi-Platform",
      },
      {
        id: "rs-002",
        name: "Gaming Stream",
        status: "active",
        type: "streaming",
        duration: "Indefinite",
        url: "https://app.restream.io/channel/gaming",
        rtmpUrl: "rtmp://live.restream.io/live",
        streamKey: "restream-gaming-e1f2g3h4i5",
        createdAt: "2/25/2026",
        resolution: "1920x1080",
        bitrate: "8000 kbps",
        fps: "60",
        viewers: 156,
        config: "Gaming HD",
      },
    ],
  },
  {
    id: "castr",
    name: "Castr",
    slug: "castr",
    description:
      "All-in-one live streaming and video hosting solution with multistreaming, scheduling, and embedded player options.",
    logo: "C",
    website: "https://castr.io",
    features: [
      "Multistreaming",
      "Video Hosting",
      "Embedded Player",
      "Stream Recording",
      "Paywall & Monetization",
      "24/7 Streaming",
    ],
    channels: [
      {
        id: "ct-001",
        name: "24/7 Music",
        status: "live",
        type: "streaming",
        duration: "Indefinite",
        url: "https://player.castr.io/live/music-247",
        rtmpUrl: "rtmp://live.castr.io/static",
        streamKey: "castr-music-j6k7l8m9n0",
        createdAt: "2/10/2026",
        resolution: "1280x720",
        bitrate: "3000 kbps",
        fps: "30",
        viewers: 890,
        config: "24/7 Loop",
      },
      {
        id: "ct-002",
        name: "Event Coverage",
        status: "active",
        type: "streaming",
        duration: "Indefinite",
        url: "https://player.castr.io/live/event-2026",
        rtmpUrl: "rtmp://live.castr.io/static",
        streamKey: "castr-event-o1p2q3r4s5",
        createdAt: "3/2/2026",
        resolution: "1920x1080",
        bitrate: "5000 kbps",
        fps: "30",
        viewers: 45,
        config: "Event Pro",
      },
      {
        id: "ct-003",
        name: "Podcast Live",
        status: "inactive",
        type: "vod",
        duration: "55m",
        url: "https://player.castr.io/vod/podcast-ep12",
        rtmpUrl: "rtmp://live.castr.io/static",
        streamKey: "castr-podcast-t6u7v8w9x0",
        createdAt: "2/18/2026",
        resolution: "1920x1080",
        bitrate: "4500 kbps",
        fps: "30",
        viewers: 0,
        config: "Standard",
      },
    ],
  },
];

export function getProvider(slug: string): StreamProvider | undefined {
  return streamProviders.find((p) => p.slug === slug);
}

export function getChannel(
  providerSlug: string,
  channelId: string,
): Channel | undefined {
  const provider = getProvider(providerSlug);
  return provider?.channels.find((c) => c.id === channelId);
}
