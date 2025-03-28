
import React from 'react';
import CalendarEntry from '@/components/CalendarEntry';
import { CalendarPost } from '@/types/calendar';

interface PostGridProps {
  posts: CalendarPost[];
  themeColor: string;
  onViewPost: (postId: number) => void;
  onUpload: (postId: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onStatusChange: (postId: number) => void;
  isUploading: number | null;
}

const PostGrid: React.FC<PostGridProps> = ({
  posts,
  themeColor,
  onViewPost,
  onUpload,
  onStatusChange,
  isUploading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      {posts.map((post, index) => (
        <div 
          key={post.id}
          className="animate-scale-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CalendarEntry
            date={post.date + (post.time ? ` ${post.time}` : '')}
            day={post.dayOfWeek}
            title={post.title}
            type={post.postType}
            text={post.text}
            highlighted={true}
            themeColor={themeColor}
            completed={post.completed}
            onSelect={() => onViewPost(post.id)}
            onUpload={(e) => onUpload(post.id, e)}
            onStatusChange={() => onStatusChange(post.id)}
            isUploading={isUploading === post.id}
            socialNetworks={post.socialNetworks || []}
          />
        </div>
      ))}
    </div>
  );
};

export default PostGrid;
