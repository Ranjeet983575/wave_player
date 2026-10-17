export type LocalVideo = {
  id: string;
  uri: string;
  title: string;
  duration: number;
  width?: number;
  height?: number;
  creationTime?: number;
  albumId?: string | null;
  isImported?: boolean;
};

export type PlaybackRecord = {
  id: string;
  title: string;
  uri: string;
  position: number;
  duration: number;
  updatedAt: number;
};

export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
};

export type PlayerPreferences = {
  skipInterval: 10 | 15 | 30;
  defaultSpeed: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;
  autoResume: boolean;
};
