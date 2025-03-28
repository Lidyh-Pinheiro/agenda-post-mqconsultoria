
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarPost } from '@/types/calendar';
import { Trash2 } from 'lucide-react';

interface PostListProps {
  posts: CalendarPost[];
  themeColor: string;
  onViewPost: (postId: number) => void;
  onEditPost: (post: CalendarPost) => void;
  onDeletePost: (postId: number) => void;
}

const PostList: React.FC<PostListProps> = ({
  posts,
  themeColor,
  onViewPost,
  onEditPost,
  onDeletePost
}) => {
  if (posts.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={5} className="text-center py-4 text-gray-500">
          Nenhuma postagem encontrada para este mês.
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {posts.map((post) => (
        <TableRow key={post.id} className="cursor-pointer hover:bg-gray-50">
          <TableCell className="font-medium" onClick={() => onViewPost(post.id)}>
            <div 
              className="text-white text-xs font-medium py-1 px-2 rounded-full inline-flex"
              style={{ backgroundColor: themeColor }}
            >
              {post.date}
            </div>
          </TableCell>
          <TableCell onClick={() => onViewPost(post.id)}>{post.title}</TableCell>
          <TableCell onClick={() => onViewPost(post.id)}>{post.postType}</TableCell>
          <TableCell onClick={() => onViewPost(post.id)}>
            {post.completed ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Concluído
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pendente
              </span>
            )}
          </TableCell>
          <TableCell className="text-right">
            <div className="flex justify-end items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-100"
                style={{ color: themeColor }}
                onClick={() => onEditPost(post)}
              >
                Editar
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-gray-100"
                style={{ color: themeColor }}
                onClick={() => onViewPost(post.id)}
              >
                Ver
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-red-100 text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeletePost(post.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default PostList;
