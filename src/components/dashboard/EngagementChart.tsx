
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  BarChart as RechartsBarChart, 
  Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

interface ChartData {
  name: string;
  posts: number;
  color: string;
}

interface EngagementChartProps {
  chartData: ChartData[];
}

const EngagementChart: React.FC<EngagementChartProps> = ({ chartData }) => {
  if (chartData.length === 0) return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Ranking de Engajamento</CardTitle>
        <CardDescription>Quantidade de posts por cliente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={50}
                fontSize={11}
              />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar 
                dataKey="posts" 
                name="Posts" 
                radius={[4, 4, 0, 0]}
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default EngagementChart;
