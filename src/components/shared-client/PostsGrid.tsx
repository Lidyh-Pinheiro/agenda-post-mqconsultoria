
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import CalendarEntry from '@/components/CalendarEntry';

interface CalendarPost {
  id: string;
  date: string;
  day: string;
  dayOfWeek: string;
  title: string;
  type: string;
  postType: string;
  text: string;
  completed?: boolean;
  notes?: string;
  images?: string[];
  clientId?: string;
  socialNetworks?: string[];
}

interface PostsGridProps {
  posts: CalendarPost[];
  themeColor: string;
}

const PostsGrid: React.FC<PostsGridProps> = ({ posts, themeColor }) => {
  if (posts.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-700">
              Nenhuma postagem disponível para visualização
            </h3>
            <p className="text-gray-500 mt-2">
              Não foram encontradas postagens para este cliente. Verifique se as postagens foram adicionadas ou se o link está correto.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr print:grid-cols-2 print:gap-8">
      {posts.map((post) => (
        <div key={post.id} className="flex print:page-break-inside-avoid">
          <CalendarEntry
            date={post.date}
            day={post.dayOfWeek}
            title={post.title}
            type={post.postType}
            text={post.text}
            highlighted={true}
            themeColor={themeColor}
            completed={post.completed}
            socialNetworks={post.socialNetworks || []}
            preview={true}
            hideIcons={true}
            className="print:shadow-none print:border print:border-gray-200"
          />
        </div>
      ))}
    </div>
  );
};

export default PostsGrid;
