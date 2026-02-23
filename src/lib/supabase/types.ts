export interface Database {
  public: {
    Tables: {
      yachts: {
        Row: {
          id: string;
          slug: string;
          name: string;
          tagline: string;
          description: string;
          builder: string;
          year: number;
          refit: number | null;
          length_ft: number;
          length_m: number;
          capacity: number;
          cabins: number | null;
          location: string;
          featured: boolean;
          youtube_shorts: string[];
          youtube_video: string;
          show_videos: boolean;
          daily_rules: string;
          weekly_rules: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          tagline?: string;
          description?: string;
          builder?: string;
          year?: number;
          refit?: number | null;
          length_ft?: number;
          length_m?: number;
          capacity?: number;
          cabins?: number | null;
          location?: string;
          featured?: boolean;
          youtube_shorts?: string[];
          youtube_video?: string;
          show_videos?: boolean;
          daily_rules?: string;
          weekly_rules?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          tagline?: string;
          description?: string;
          builder?: string;
          year?: number;
          refit?: number | null;
          length_ft?: number;
          length_m?: number;
          capacity?: number;
          cabins?: number | null;
          location?: string;
          featured?: boolean;
          youtube_shorts?: string[];
          youtube_video?: string;
          show_videos?: boolean;
          daily_rules?: string;
          weekly_rules?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      yacht_images: {
        Row: {
          id: string;
          yacht_id: string;
          url: string;
          storage_path: string;
          category: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          yacht_id: string;
          url: string;
          storage_path?: string;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          yacht_id?: string;
          url?: string;
          storage_path?: string;
          category?: string;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      yacht_specs: {
        Row: {
          id: string;
          yacht_id: string;
          label: string;
          value: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          yacht_id: string;
          label: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          yacht_id?: string;
          label?: string;
          value?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      yacht_amenities: {
        Row: {
          id: string;
          yacht_id: string;
          icon: string;
          label: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          yacht_id: string;
          icon?: string;
          label: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          yacht_id?: string;
          icon?: string;
          label?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      yacht_pricing: {
        Row: {
          id: string;
          yacht_id: string;
          season: string;
          period: string;
          hourly: number | null;
          daily: number | null;
          weekly: number | null;
          monthly: number | null;
          hourly_b2b: number | null;
          daily_b2b: number | null;
          weekly_b2b: number | null;
          monthly_b2b: number | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          yacht_id: string;
          season: string;
          period: string;
          hourly?: number | null;
          daily?: number | null;
          weekly?: number | null;
          monthly?: number | null;
          hourly_b2b?: number | null;
          daily_b2b?: number | null;
          weekly_b2b?: number | null;
          monthly_b2b?: number | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          yacht_id?: string;
          season?: string;
          period?: string;
          hourly?: number | null;
          daily?: number | null;
          weekly?: number | null;
          monthly?: number | null;
          hourly_b2b?: number | null;
          daily_b2b?: number | null;
          weekly_b2b?: number | null;
          monthly_b2b?: number | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      yacht_included: {
        Row: {
          id: string;
          yacht_id: string;
          item: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          yacht_id: string;
          item: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          yacht_id?: string;
          item?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      destinations: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          short_description: string | null;
          sailing_time: string;
          best_for: string[];
          image: string;
          cover_image: string | null;
          gallery_images: string[];
          highlights: string[];
          sort_order: number;
          category: string;
          duration: string | null;
          price_from: number | null;
          latitude: number | null;
          longitude: number | null;
          map_label: string | null;
          video_url: string | null;
          featured: boolean;
          what_included: string[];
          itinerary: string[];
          map_x: number | null;
          map_y: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string;
          short_description?: string | null;
          sailing_time?: string;
          best_for?: string[];
          image?: string;
          cover_image?: string | null;
          gallery_images?: string[];
          highlights?: string[];
          sort_order?: number;
          category?: string;
          duration?: string | null;
          price_from?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          map_label?: string | null;
          video_url?: string | null;
          featured?: boolean;
          what_included?: string[];
          itinerary?: string[];
          map_x?: number | null;
          map_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string;
          short_description?: string | null;
          sailing_time?: string;
          best_for?: string[];
          image?: string;
          cover_image?: string | null;
          gallery_images?: string[];
          highlights?: string[];
          sort_order?: number;
          category?: string;
          duration?: string | null;
          price_from?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          map_label?: string | null;
          video_url?: string | null;
          featured?: boolean;
          what_included?: string[];
          itinerary?: string[];
          map_x?: number | null;
          map_y?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      image_category: "hero" | "exterior" | "interior" | "cabin" | "deck" | "dining" | "other";
    };
  };
}

export type Yacht = Database["public"]["Tables"]["yachts"]["Row"];
export type YachtImage = Database["public"]["Tables"]["yacht_images"]["Row"];
export type YachtSpec = Database["public"]["Tables"]["yacht_specs"]["Row"];
export type YachtAmenity = Database["public"]["Tables"]["yacht_amenities"]["Row"];
export type YachtPricing = Database["public"]["Tables"]["yacht_pricing"]["Row"];
export type YachtIncluded = Database["public"]["Tables"]["yacht_included"]["Row"];
export type DestinationRow = Database["public"]["Tables"]["destinations"]["Row"];
