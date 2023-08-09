export interface Kickinterface {
	id: number;
    user_id: number;
    slug: string;
    playback_url: string;
    user: {
      username: string;
      bio: string;
      profile_pic?: string;
      profilePic?: string;
    };
    livestream?: {
      is_live: boolean;
      categories: {
        name: string;
      }[];
      viewer_count: number;
      is_mature: boolean;
      session_title: string;
    };
    followers_count?: number;
    verified?: boolean | object | null;
	followersCount?: number;
	isLive?: boolean;
	chatroom?: {
		id: number;
	};
}

export interface KickVideoInterface {
	channel_id: number;
	session_title: string;
	source: string;
	views: number;
	duration: number;
	start_time: number;
	categories: {
		name: string;
	}[];
	thumbnail: {
		src: string;
	};
	video: {
		uuid: string;
	}
	videoQualities?: {
		src1080p60: string;
		src720p60: string;
		src480p30: string;
		src360p30: string;
		src160p30: string;
	};
	durationString: string;
}

export interface CastjsInterface {
	available: boolean;
	connected: boolean;
	device: string;
	src: string;
	title: string;
	description: string;
	poster: string;
	subtitles: object[];
	volumeLevel: number;
	muted: boolean;
	paused: boolean;
	time: number;
	timePretty: string;
	duration: number;
	durationPretty: string;
	progress: number;
	state: string;

	constructor(options: { receiver?: string, joinpolicy?: string }): CastjsInterface;

	on(eventType: string, callback: (e: any) => void): void;

	cast(source: string, metadata?: object): void;

	volume(level: number): void;

	play(): void;

	pause(): void;

	mute(): void;

	unmute(): void;

	subtitle(index: number): void;

	seek(time: number, relative?: boolean): void;

	disconnect(): void;
}