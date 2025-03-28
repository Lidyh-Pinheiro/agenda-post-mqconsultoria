
import { CalendarPost } from "@/types/calendar";
import { parse } from "date-fns";
import { isSameDay } from "date-fns";

export const sortPostsByDate = (postsToSort: CalendarPost[]): CalendarPost[] => {
  return [...postsToSort].sort((a, b) => {
    const dateA = parse(a.date, 'dd/MM', new Date());
    const dateB = parse(b.date, 'dd/MM', new Date());
    
    return dateA.getTime() - dateB.getTime();
  });
};

export const parsePostDate = (dateStr: string) => {
  const [day, month] = dateStr.split('/');
  const year = new Date().getFullYear();
  return new Date(year, parseInt(month) - 1, parseInt(day));
};

export const isDateWithPosts = (date: Date, posts: CalendarPost[]) => {
  return posts.some(post => {
    const postDate = parsePostDate(post.date);
    return isSameDay(postDate, date);
  });
};
