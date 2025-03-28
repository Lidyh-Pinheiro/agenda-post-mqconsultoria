
import React from 'react';
import { Card } from '@/components/ui/card';
import { Filter } from 'lucide-react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CalendarPost } from '@/types/calendar';
import PostList from './PostList';

interface PostTableProps {
  themeColor: string;
  filteredPosts: CalendarPost[];
  onViewPost: (postId: number) => void;
  onEditPost: (post: CalendarPost) => void;
  onDeletePost: (postId: number) => void;
}

const PostTable: React.FC<PostTableProps> = ({
  themeColor,
  filteredPosts,
  onViewPost,
  onEditPost,
  onDeletePost
}) => {
  return (
    <Card className="p-6 shadow-md bg-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Filter 
            className="w-5 h-5 mr-2"
            style={{ color: themeColor }} 
          />
          Lista de Postagens
        </h3>
      </div>

      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Data</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <PostList 
              posts={filteredPosts}
              themeColor={themeColor}
              onViewPost={onViewPost}
              onEditPost={onEditPost}
              onDeletePost={onDeletePost}
            />
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default PostTable;
