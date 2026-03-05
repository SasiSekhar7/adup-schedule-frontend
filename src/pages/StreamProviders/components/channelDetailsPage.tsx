"use client";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useRef } from "react";

import {
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Clock,
  Monitor,
  Radio,
  Settings2,
  Download,
  ChevronRight,
  Info,
  Play,
  Square,
} from "lucide-react";
import {
  getProvider,
  getChannel,
} from "@/pages/StreamProviders/components/providers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/api";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  );
}

export default function ChannelDetailPage() {
  const { slug: providerSlug, channelId } = useParams();
  const [channel, setChannel] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showWebcamModal, setShowWebcamModal] = useState(false);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<any>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    fetchChannelById(channelId as string);
  }, []);
  const fetchChannelById = async (channelId: string) => {
    try {
      const res = await api.get(`/streaming/channel/${channelId}`);

      console.log("Channel Details:", res.data);

      setChannel(res.data);
    } catch (error) {
      console.error("Failed to fetch channel:", error);
    }
  };
  const [showStreamKey, setShowStreamKey] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [viewers, setViewers] = useState(0);

  const provider = getProvider(providerSlug as string);
  //   const channel = getChannel(providerSlug as string, channelId as string);

  // Initialize live state from channel data
  //   const currentStatus = isLive
  //     ? "live"
  //     : channel?.status === "live"
  //       ? "live"
  //       : (channel?.status ?? "active");
  const currentViewers = isLive ? viewers : (channel?.viewers ?? 0);
  const currentStatus = channel?.status;

  //   const handleToggleLive = () => {
  //     if (isLive) {
  //       setIsLive(false);
  //       setViewers(0);
  //     } else {
  //       setIsLive(true);
  //       setViewers(Math.floor(Math.random() * 500) + 10);
  //     }
  //   };

  const handleToggleLive = async (channel: any) => {
    try {
      if (!channel) return;
      setActionLoading(channel.channel_id);

      if (channel.status === "live") {
        // STOP STREAM
        await api.put(`/streaming/channel/${channel.channel_id}/stop`);
        await fetchChannelById(channelId as string);
      } else {
        // START STREAM
        await api.put(`/streaming/channel/${channel.channel_id}/start`);
        await fetchChannelById(channelId as string);
      }
    } catch (error) {
      console.error("Failed to toggle stream:", error);
    } finally {
      setActionLoading(null);
    }
  };

const startWebcamPreview = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    setWebcamStream(stream);

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  } catch (err) {
    console.error("Webcam error", err);
  }
};

  const startWebcamLive = async () => {
    if (!webcamStream) return;

    await api.post(`/start-stream`);

    const recorder = new MediaRecorder(webcamStream, {
      mimeType: "video/webm; codecs=vp8",
    });

   recorder.ondataavailable = async (event) => {
  if (event.data.size > 0) {
    const arrayBuffer = await event.data.arrayBuffer();

    await fetch("http://localhost:8080/api/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: arrayBuffer,
    });
  }
};

    recorder.start(1000);
    setMediaRecorder(recorder);
  };

  const stopWebcamLive = async () => {
    if (mediaRecorder) mediaRecorder.stop();

    await api.post(`/stop-stream`);

    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
    }

    setShowWebcamModal(false);
  };

  if (!provider || !channel) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto p-6">
        {/* Channel Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-foreground text-primary-foreground font-bold">
              {provider.logo}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {channel.name}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {provider.name} Channel
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {channel.status === "live" ? (
              <Badge className="bg-emerald-600 text-primary-foreground border-0 text-[11px]">
                <span className="mr-1 inline-block size-1.5 rounded-full bg-primary-foreground animate-pulse" />
                live
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="text-[11px] text-muted-foreground"
              >
                {channel.status}
              </Badge>
            )}
            {/* {channel.type === "streaming" ? (
              <Badge className="bg-red-50 text-red-600 border-0">
                Streaming
              </Badge>
            ) : channel.type === "website" ? (
              <Badge className="bg-muted text-muted-foreground border-0">
                Website
              </Badge>
            ) : (
              <Badge className="bg-blue-50 text-blue-600 border-0">VOD</Badge>
            )} */}
            {/* {channel.type === "streaming" && (
              <Button
                size="sm"
                className={`ml-2 gap-1.5 ${
                  currentStatus === "live"
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                }`}
                onClick={handleToggleLive}
              >
                {currentStatus === "live" ? (
                  <>
                    <Square className="size-3.5" />
                    Stop Live
                  </>
                ) : (
                  <>
                    <Play className="size-3.5" />
                    Go Live
                  </>
                )}
              </Button>
            )} */}
            {channel && (
              <>
                <Button
                  size="sm"
                  disabled={actionLoading === channel.channel_id}
                  variant={
                    channel.status === "live" ? "destructive" : "default"
                  }
                  className={`h-7 gap-1.5 text-xs ${
                    channel.status === "live"
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }`}
                  onClick={() => handleToggleLive(channel)}
                >
                  {actionLoading === channel.channel_id ? (
                    "Loading..."
                  ) : channel.status === "live" ? (
                    <>
                      <Square className="size-3" />
                      Stop Live
                    </>
                  ) : (
                    <>
                      <Play className="size-3" />
                      Go Live
                    </>
                  )}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={() => {
                    setShowWebcamModal(true);
                    startWebcamPreview();
                  }}
                >
                  <Radio className="size-3.5" />
                  Go Live with Webcam
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Channel Details Grid */}
        {/* <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              Duration
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {channel.duration}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="size-4" />
              Current Viewers
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {currentViewers.toLocaleString()}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Monitor className="size-4" />
              Resolution
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {channel.resolution}
            </p>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Radio className="size-4" />
              Bitrate / FPS
            </div>
            <p className="mt-2 text-xl font-semibold text-foreground">
              {channel.bitrate} / {channel.fps}fps
            </p>
          </div>
        </div> */}

        {/* Stream URL */}
        <div className="mb-6 rounded-xl border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings2 className="size-4" />
            Stream Configuration
          </h2>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Stream URL
              </label>
              <div className="mt-1.5 flex items-center rounded-lg bg-muted px-3 py-2.5">
                <code className="flex-1 truncate text-sm font-mono text-foreground">
                  {/* {channel.url} */}
                  {channel.playback_url}
                </code>
                <CopyButton text={channel.playback_url} />
              </div>
            </div>
            {/* <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Config Profile
              </label>
              <div className="mt-1.5 flex items-center rounded-lg bg-muted px-3 py-2.5">
                <span className="text-sm text-foreground">
                  {channel.config || "Default"}
                </span>
              </div>
            </div> */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Created At
              </label>
              <div className="mt-1.5 flex items-center rounded-lg bg-muted px-3 py-2.5">
                <span className="text-sm text-foreground">
                  {/* {channel.createdAt} */}
                  {new Date(channel.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* OBS Setup Section */}
        <div className="rounded-xl border bg-card overflow-hidden">
          <div className="border-b bg-muted/50 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-foreground text-primary-foreground">
                <Monitor className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">
                  OBS Studio Setup Guide
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configure OBS to stream to {provider.name}
                </p>
              </div>
            </div>
            <a
              href="https://obsproject.com/download"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="size-3.5" />
                Download OBS
                <ExternalLink className="size-3" />
              </Button>
            </a>
          </div>

          <div className="p-5">
            {/* RTMP URL & Stream Key */}
            <div className="mb-6 rounded-lg border border-dashed bg-muted/30 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Info className="size-4 text-muted-foreground" />
                Your Streaming Credentials
              </h3>
              <div className="grid gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    RTMP Server URL
                  </label>
                  <div className="mt-1.5 flex items-center rounded-lg bg-card border px-3 py-2.5">
                    <code className="flex-1 truncate text-sm font-mono text-foreground">
                      {/* {channel.rtmpUrl} */}
                      {channel.ingest_url}
                    </code>
                    <CopyButton text={channel.ingest_url} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Stream Key
                  </label>
                  <div className="mt-1.5 flex items-center rounded-lg bg-card border px-3 py-2.5">
                    <code className="flex-1 truncate text-sm font-mono text-foreground">
                      {/* {showStreamKey
                        ? channel.streamKey
                        : "************************************"} */}
                      {showStreamKey
                        ? channel.stream_key
                        : "************************************"}
                    </code>
                    <button
                      onClick={() => setShowStreamKey(!showStreamKey)}
                      className="ml-2 inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      aria-label={
                        showStreamKey ? "Hide stream key" : "Show stream key"
                      }
                    >
                      {showStreamKey ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </button>
                    <CopyButton text={channel.stream_key} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-destructive">
                    Never share your stream key. Anyone with this key can stream
                    to your channel.
                  </p>
                </div>
              </div>
            </div>

            {/* Step by Step Guide */}
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Step-by-Step Setup Instructions
            </h3>

            <div className="grid gap-4">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    1
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Download & Install OBS Studio
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    If you haven&apos;t already, download OBS Studio from the
                    official website. It&apos;s free and open-source software
                    available for Windows, macOS, and Linux.
                  </p>
                  <a
                    href="https://obsproject.com/download"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline"
                  >
                    https://obsproject.com/download
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    2
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Open OBS Stream Settings
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Launch OBS Studio, then go to{" "}
                    <strong className="text-foreground">
                      {'"'}Settings{'"'}
                    </strong>{" "}
                    (bottom-right or File menu) and click on the{" "}
                    <strong className="text-foreground">
                      {'"'}Stream{'"'}
                    </strong>{" "}
                    tab in the left sidebar.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    3
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Configure Stream Service
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    In the Stream settings, set the following:
                  </p>
                  <ul className="mt-2 grid gap-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span>
                        <strong className="text-foreground">Service:</strong>{" "}
                        Select{" "}
                        <strong className="text-foreground">
                          {'"'}Custom...{'"'}
                        </strong>{" "}
                        from the dropdown
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span>
                        <strong className="text-foreground">Server:</strong>{" "}
                        Paste the RTMP URL shown above
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 size-4 shrink-0 text-foreground" />
                      <span>
                        <strong className="text-foreground">Stream Key:</strong>{" "}
                        Paste your Stream Key shown above
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    4
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Configure Output Settings (Recommended)
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Go to the{" "}
                    <strong className="text-foreground">
                      {'"'}Output{'"'}
                    </strong>{" "}
                    tab and configure these recommended settings for{" "}
                    {provider.name}:
                  </p>
                  <div className="mt-3 rounded-lg bg-muted p-3 grid gap-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Output Mode:
                      </span>
                      <span className="font-mono text-foreground">
                        Advanced
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Encoder:</span>
                      <span className="font-mono text-foreground">
                        x264 (or NVENC)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Rate Control:
                      </span>
                      <span className="font-mono text-foreground">CBR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bitrate:</span>
                      <span className="font-mono text-foreground">
                        {channel.bitrate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Keyframe Interval:
                      </span>
                      <span className="font-mono text-foreground">2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    5
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Configure Video Settings
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Go to the{" "}
                    <strong className="text-foreground">
                      {'"'}Video{'"'}
                    </strong>{" "}
                    tab:
                  </p>
                  <div className="mt-3 rounded-lg bg-muted p-3 grid gap-1.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Base Resolution:
                      </span>
                      <span className="font-mono text-foreground">
                        {channel.resolution}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Output Resolution:
                      </span>
                      <span className="font-mono text-foreground">
                        {channel.resolution}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">FPS:</span>
                      <span className="font-mono text-foreground">
                        {channel.fps}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-foreground text-primary-foreground text-sm font-bold">
                    6
                  </div>
                  <div className="mt-2 w-px flex-1 bg-border" />
                </div>
                <div className="pb-6">
                  <h4 className="font-medium text-foreground">
                    Add Your Sources
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    In the OBS main window, click the{" "}
                    <strong className="text-foreground">
                      {'"'}+{'"'}
                    </strong>{" "}
                    button under Sources and add your video/audio inputs:
                  </p>
                  <ul className="mt-2 grid gap-1.5 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <ChevronRight className="size-4 shrink-0 text-foreground" />
                      <strong className="text-foreground">
                        Video Capture Device
                      </strong>{" "}
                      - for webcam
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="size-4 shrink-0 text-foreground" />
                      <strong className="text-foreground">
                        Display Capture
                      </strong>{" "}
                      - for screen sharing
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="size-4 shrink-0 text-foreground" />
                      <strong className="text-foreground">
                        Audio Input Capture
                      </strong>{" "}
                      - for microphone
                    </li>
                    <li className="flex items-center gap-2">
                      <ChevronRight className="size-4 shrink-0 text-foreground" />
                      <strong className="text-foreground">Media Source</strong>{" "}
                      - for pre-recorded video files
                    </li>
                  </ul>
                </div>
              </div>

              {/* Step 7 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-primary-foreground text-sm font-bold">
                    7
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">
                    Start Streaming
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Click{" "}
                    <strong className="text-foreground">
                      {'"'}Start Streaming{'"'}
                    </strong>{" "}
                    in the bottom-right of OBS. Your stream will go live on{" "}
                    {provider.name} within a few seconds. You can monitor the
                    stream status, bitrate, and dropped frames in the OBS status
                    bar.
                  </p>
                  <div className="mt-3 rounded-lg border border-dashed bg-emerald-50 p-3">
                    <p className="text-sm text-emerald-800">
                      <strong>Tip:</strong> Always do a test stream before going
                      live to ensure your audio/video quality and settings are
                      correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWebcamModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background rounded-xl p-6 w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Webcam Live Stream</h2>

            <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full rounded"
      />

            <div className="flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowWebcamModal(false)}
              >
                Cancel
              </Button>

              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={startWebcamLive}
              >
                Start Live
              </Button>

              <Button variant="destructive" onClick={stopWebcamLive}>
                Stop
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
