import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, MessageSquare, Phone, Mail } from "lucide-react";
import { useCompanyId } from "@/hooks/useCompanyId";

interface AnalyticsData {
  totalChatbotLeads: number;
  totalContactLeads: number;
  conversionRate: number;
  leadsThisMonth: number;
  dailyLeads: any[];
  statusDistribution: any[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const STATUS_LABELS = {
  NEW: 'Novo',
  CONTACTED: 'Contatado',
  NEGOTIATING: 'Negociando',
  CONVERTED: 'Convertido',
  LOST: 'Perdido',
};

const STATUS_COLORS = {
  NEW: '#0088FE',       // Azul
  CONTACTED: '#00C49F', // Verde
  NEGOTIATING: '#FFBB28', // Amarelo
  CONVERTED: '#FF8042', // Laranja
  LOST: '#8884d8',     // Roxo
};

export const AnalyticsDashboard = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalChatbotLeads: 0,
    totalContactLeads: 0,
    conversionRate: 0,
    leadsThisMonth: 0,
    dailyLeads: [],
    statusDistribution: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      loadAnalytics();
    }
  }, [companyId]);

  const loadAnalytics = async () => {
    if (!companyId) return;
    
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // Buscar todos os leads
      const [chatbotResponse, contactResponse] = await Promise.all([
        supabase
          .from('chatbot_leads')
          .select('*')
          .eq('company_id', companyId),
        supabase
          .from('contact_form_leads')
          .select('*')
          .eq('company_id', companyId)
      ]);

      if (chatbotResponse.error) throw chatbotResponse.error;
      if (contactResponse.error) throw contactResponse.error;

      const chatbotLeads = chatbotResponse.data || [];
      const contactLeads = contactResponse.data || [];

      // Calcular total de leads
      const totalChatbotLeads = chatbotLeads.length;
      const totalContactLeads = contactLeads.length;

      // Calcular taxa de conversão (leads com status CONVERTED)
      const convertedChatbotLeads = chatbotLeads.filter(lead => lead.conversion_status === 'CONVERTED').length;
      const convertedContactLeads = contactLeads.filter(lead => lead.status === 'CONVERTED').length;
      const totalConverted = convertedChatbotLeads + convertedContactLeads;
      const totalLeads = totalChatbotLeads + totalContactLeads;
      const conversionRate = totalLeads > 0 ? (totalConverted / totalLeads) * 100 : 0;

      // Calcular leads deste mês
      const leadsThisMonth = [...chatbotLeads, ...contactLeads]
        .filter(lead => {
          const leadDate = new Date(lead.created_at);
          return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear;
        }).length;

      // Distribuição de status
      const statusCounts = {
        NEW: 0,
        CONTACTED: 0,
        NEGOTIATING: 0,
        CONVERTED: 0,
        LOST: 0,
      };

      // Processar chatbot leads
      chatbotLeads.forEach(lead => {
        const status = lead.conversion_status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      // Processar contact leads
      contactLeads.forEach(lead => {
        const status = lead.status;
        if (statusCounts.hasOwnProperty(status)) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
        name: status,
        value: count,
        label: STATUS_LABELS[status as keyof typeof STATUS_LABELS],
      }));

      // Leads diários dos últimos 30 dias
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyLeads = last30Days.map(date => {
        const count = [...chatbotLeads, ...contactLeads].filter(lead => 
          lead.created_at.split('T')[0] === date
        ).length;

        return {
          date,
          leads: count
        };
      });

      setAnalyticsData({
        totalChatbotLeads,
        totalContactLeads,
        conversionRate,
        leadsThisMonth,
        dailyLeads,
        statusDistribution
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar análises.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingCompanyId || isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vermelho-ativo"></div>
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">Você não tem acesso a nenhuma empresa.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold text-preto-grafite">Dashboard de Leads</h2>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.totalChatbotLeads + analyticsData.totalContactLeads}
            </div>
            <p className="text-xs text-gray-500">
              Chatbot: {analyticsData.totalChatbotLeads} | Formulário: {analyticsData.totalContactLeads}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.conversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500">
              Leads convertidos em clientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leads este Mês</CardTitle>
            <MessageSquare className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.leadsThisMonth}</div>
            <p className="text-xs text-gray-500">
              Novos leads no mês atual
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Diária</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analyticsData.leadsThisMonth / 30).toFixed(1)}
            </div>
            <p className="text-xs text-gray-500">
              Leads por dia no mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Leads por Dia (Últimos 30 dias)</CardTitle>
            <div className="text-sm text-gray-500 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-[#8884d8] mr-2"></div>
                <span>Total de leads diários</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.dailyLeads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [value, 'Leads']}
                  labelFormatter={(label) => new Date(label).toLocaleDateString('pt-BR')}
                />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Status</CardTitle>
            <div className="text-sm text-gray-500 mt-2 grid grid-cols-2 gap-2">
              {Object.entries(STATUS_LABELS).map(([status, label]) => (
                <div key={status} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS] }}
                  ></div>
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ value }) => value > 0 ? value : ''}
                >
                  {analyticsData.statusDistribution.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} 
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
