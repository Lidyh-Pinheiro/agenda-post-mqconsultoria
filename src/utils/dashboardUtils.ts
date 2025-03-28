
import { Client } from '@/contexts/SettingsContext';

// Get active clients count
export const getActiveClientsCount = (clients: Client[]): number => {
  return clients?.filter(client => client.active !== false).length || 0;
};

// Get total posts count across all clients
export const getTotalPostsCount = (clients: Client[]): number => {
  return clients?.reduce((sum, client) => sum + (client.postsCount || 0), 0) || 0;
};

// Prepare data for client engagement chart
export const prepareChartData = (clients: Client[]) => {
  const chartData = clients?.map(client => ({
    name: client.name.length > 10 ? client.name.substring(0, 10) + '...' : client.name,
    posts: client.postsCount || 0,
    color: client.themeColor
  })) || [];
  
  // Sort chart data by post count (descending)
  return chartData.sort((a, b) => b.posts - a.posts);
};
