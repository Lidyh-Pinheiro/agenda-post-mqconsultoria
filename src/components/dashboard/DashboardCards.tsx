
import React from 'react';
import { Users, Calendar, BarChart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Client } from '@/contexts/SettingsContext';

interface DashboardCardsProps {
  clients: Client[];
  activeClientsCount: number;
  totalPostsCount: number;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({ 
  clients, 
  activeClientsCount, 
  totalPostsCount 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeClientsCount}</div>
          <p className="text-xs text-muted-foreground">
            Total de clientes gerenciados
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendas Ativas</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPostsCount}</div>
          <p className="text-xs text-muted-foreground">
            Total de posts agendados
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média de Posts</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {clients && clients.length > 0 
              ? (totalPostsCount / clients.length).toFixed(1) 
              : "0"}
          </div>
          <p className="text-xs text-muted-foreground">
            Posts por cliente
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
