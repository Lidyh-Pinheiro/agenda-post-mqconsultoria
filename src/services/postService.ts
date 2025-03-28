
import { firebaseDB } from "@/integrations/firebase/client";
import { CalendarPost } from "@/types/calendar";
import { sortPostsByDate } from "@/utils/calendarUtils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const loadClientPosts = async (clientId: string): Promise<CalendarPost[]> => {
  try {
    const allPosts = await firebaseDB.getPosts();
    if (allPosts) {
      const clientPosts = allPosts.filter((post: CalendarPost) => post.clientId === clientId);
      return sortPostsByDate(clientPosts);
    }
    return [];
  } catch (error) {
    console.error("Error loading posts:", error);
    
    // Fallback to localStorage
    const storedPosts = localStorage.getItem('calendarPosts');
    if (storedPosts) {
      const allPosts = JSON.parse(storedPosts);
      const clientPosts = allPosts.filter((post: CalendarPost) => post.clientId === clientId);
      return sortPostsByDate(clientPosts);
    }
    return [];
  }
};

export const savePosts = async (posts: CalendarPost[], clientId: string, postToDelete: number | null = null) => {
  try {
    const allPosts = await firebaseDB.getPosts() || [];
    
    const otherPosts = allPosts.filter((p: CalendarPost) => 
      p.clientId !== clientId || 
      (postToDelete !== null && p.id === postToDelete)
    );
    
    await firebaseDB.setPosts([...otherPosts, ...posts]);
    
    localStorage.setItem('calendarPosts', JSON.stringify([...otherPosts, ...posts]));
  } catch (error) {
    console.error("Error saving posts:", error);
  }
};

export const handleFileUpload = async (postId: number, file: File, clientPosts: CalendarPost[]) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${postId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('post_images')
      .upload(filePath, file);
      
    if (error) {
      throw error;
    }
    
    const { data: urlData } = supabase.storage
      .from('post_images')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error("Erro ao fazer upload do arquivo.");
    return null;
  }
};

export const deletePost = async (postId: number) => {
  try {
    const allPosts = await firebaseDB.getPosts() || [];
    const updatedPosts = allPosts.filter((p: CalendarPost) => p.id !== postId);
    await firebaseDB.setPosts(updatedPosts);
    
    localStorage.setItem('calendarPosts', JSON.stringify(updatedPosts));
    
    toast.success("Postagem removida com sucesso!");
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
};
