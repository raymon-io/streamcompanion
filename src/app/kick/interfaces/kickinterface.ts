export interface Kickinterface {
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
    followers_count: number;
    verified?: boolean | object | null;
}
