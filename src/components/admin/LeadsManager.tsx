import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mail, Phone, Calendar, User, Edit, Check, RefreshCw, Plus, Filter, Search, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCompanyId } from "@/hooks/useCompanyId";
import { CreateLeadDialog } from "./leads/CreateLeadDialog";
import { cleanupOldLeads } from "@/utils/leadCleanup";

interface ChatbotLead {
  id: string;
  name: string;
  contact_whatsapp: string;
  contact_email: string;
  age: number;
  height: number;
  weight: number;
  bmi: number;
  gender: string;
  primary_goal: string;
  experience_level: string;
  workout_preference: string;
  current_sports: string[];
  selected_plan_id: string;
  steps_completed: number;
  total_steps: number;
  completion_rate: number;
  conversion_status: string;
  notes: string;
  created_at: string;
  type: 'chatbot';
}

interface ContactLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  contacted: boolean;
  status: string;
  created_at: string;
  type: 'contact';
}

type Lead = ChatbotLead | ContactLead;

const statusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  NEGOTIATING: 'bg-purple-100 text-purple-800',
  CONVERTED: 'bg-green-100 text-green-800',
  LOST: 'bg-red-100 text-red-800',
};

export const LeadsManager = () => {
  const { toast } = useToast();
  const { companyId, isLoading: isLoadingCompanyId } = useCompanyId();
  const [chatbotLeads, setChatbotLeads] = useState<ChatbotLead[]>([]);
  const [contactLeads, setContactLeads] = useState<ContactLead[]>([]);
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLead, setEditingLead] = useState<any>(null);
  const [activeView, setActiveView] = useState<'all' | 'chatbot' | 'contact'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);

  useEffect(() => {
    if (companyId) {
      loadLeads();
      
      // Set up real-time subscription for chatbot leads
      const chatbotChannel = supabase
        .channel('chatbot_leads_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'chatbot_leads',
            filter: `company_id=eq.${companyId}`
          }, 
          () => loadLeads()
        )
        .subscribe();

      // Set up real-time subscription for contact form leads
      const contactChannel = supabase
        .channel('contact_leads_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'contact_form_leads',
            filter: `company_id=eq.${companyId}`
          }, 
          () => loadLeads()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(chatbotChannel);
        supabase.removeChannel(contactChannel);
      };
    }
  }, [companyId]);

  useEffect(() => {
    filterLeads();
  }, [allLeads, activeView, statusFilter, searchTerm]);

  const loadLeads = async () => {
    if (!companyId) return;
    
    try {
      const [chatbotResponse, contactResponse] = await Promise.all([
        supabase
          .from('chatbot_leads')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
        supabase
          .from('contact_form_leads')
          .select('*')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false })
      ]);

      if (chatbotResponse.error) throw chatbotResponse.error;
      if (contactResponse.error) throw contactResponse.error;

      // Convert Json to string[] for current_sports and ensure proper typing
      const formattedChatbotLeads = (chatbotResponse.data || []).map(lead => ({
        ...lead,
        current_sports: Array.isArray(lead.current_sports) 
          ? (lead.current_sports as string[])
          : [],
        type: 'chatbot' as const
      })) as ChatbotLead[];

      const formattedContactLeads = (contactResponse.data || []).map(lead => ({
        ...lead,
        type: 'contact' as const
      })) as ContactLead[];

      setChatbotLeads(formattedChatbotLeads);
      setContactLeads(formattedContactLeads);
      
      // Combine all leads
      const combined = [...formattedChatbotLeads, ...formattedContactLeads];
      setAllLeads(combined);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao carregar leads.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = allLeads;

    // Filter by type
    if (activeView === 'chatbot') {
      filtered = filtered.filter(lead => lead.type === 'chatbot');
    } else if (activeView === 'contact') {
      filtered = filtered.filter(lead => lead.type === 'contact');
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => {
        if (lead.type === 'chatbot') {
          return (lead as ChatbotLead).conversion_status === statusFilter;
        } else {
          return (lead as ContactLead).status === statusFilter;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(lead => {
        const name = lead.name?.toLowerCase() || '';
        const email = lead.type === 'chatbot' 
          ? (lead as ChatbotLead).contact_email?.toLowerCase() || ''
          : (lead as ContactLead).email?.toLowerCase() || '';
        const phone = lead.type === 'chatbot'
          ? (lead as ChatbotLead).contact_whatsapp?.toLowerCase() || ''
          : (lead as ContactLead).phone?.toLowerCase() || '';
        
        return name.includes(searchTerm.toLowerCase()) ||
               email.includes(searchTerm.toLowerCase()) ||
               phone.includes(searchTerm.toLowerCase());
      });
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, status: string, leadType: 'chatbot' | 'contact') => {
    try {
      const tableName = leadType === 'chatbot' ? 'chatbot_leads' : 'contact_form_leads';
      const statusField = leadType === 'chatbot' ? 'conversion_status' : 'status';
      
      const { error } = await supabase
        .from(tableName)
        .update({ [statusField]: status })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Status atualizado!",
        description: "Status do lead foi atualizado com sucesso.",
      });

      loadLeads();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status.",
        variant: "destructive",
      });
    }
  };

  const saveLeadNotes = async (leadId: string, notes: string, leadType: 'chatbot' | 'contact') => {
    try {
      const tableName = leadType === 'chatbot' ? 'chatbot_leads' : 'contact_form_leads';
      
      const { error } = await supabase
        .from(tableName)
        .update({ notes })
        .eq('id', leadId);

      if (error) throw error;

      toast({
        title: "Notas salvas!",
        description: "Notas do lead foram salvas com sucesso.",
      });

      setEditingLead(null);
      loadLeads();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao salvar notas.",
        variant: "destructive",
      });
    }
  };

  const getLeadStatus = (lead: Lead) => {
    return lead.type === 'chatbot' 
      ? (lead as ChatbotLead).conversion_status 
      : (lead as ContactLead).status;
  };

  const handleDeleteLead = async (lead: Lead) => {
    if (!companyId) return;

    try {
      setIsLoading(true);
      const tableName = lead.type === 'chatbot' ? 'chatbot_leads' : 'contact_form_leads';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', lead.id)
        .eq('company_id', companyId);

      if (error) throw error;

      toast({
        title: "Lead excluído!",
        description: "Lead foi excluído com sucesso.",
      });

      loadLeads();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao excluir lead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setLeadToDelete(null);
    }
  };

  const renderLeadCard = (lead: Lead) => (
    <Card key={lead.id}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base md:text-lg text-preto-grafite flex items-center gap-2">
              <User className="h-4 w-4 md:h-5 md:w-5" />
              {lead.name || 'Nome não informado'}
              <Badge variant="outline" className="text-xs">
                {lead.type === 'chatbot' ? 'Chatbot' : 'Formulário'}
              </Badge>
            </CardTitle>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs md:text-sm text-gray-600 mt-2">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                {new Date(lead.created_at).toLocaleDateString('pt-BR')}
              </span>
              {lead.type === 'chatbot' && (
                <span>Progresso: {(lead as ChatbotLead).completion_rate}%</span>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Badge className={statusColors[getLeadStatus(lead) as keyof typeof statusColors]}>
              {getLeadStatus(lead)}
            </Badge>
            <Select
              value={getLeadStatus(lead)}
              onValueChange={(value) => updateLeadStatus(lead.id, value, lead.type)}
            >
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NEW">Novo</SelectItem>
                <SelectItem value="CONTACTED">Contatado</SelectItem>
                <SelectItem value="NEGOTIATING">Negociando</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm font-medium">Contato</p>
            <p className="text-sm text-gray-600">
              {(lead.type === 'chatbot' ? (lead as ChatbotLead).contact_whatsapp : (lead as ContactLead).phone) && (
                <span className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {lead.type === 'chatbot' ? (lead as ChatbotLead).contact_whatsapp : (lead as ContactLead).phone}
                </span>
              )}
              {(lead.type === 'chatbot' ? (lead as ChatbotLead).contact_email : (lead as ContactLead).email) && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {lead.type === 'chatbot' ? (lead as ChatbotLead).contact_email : (lead as ContactLead).email}
                </span>
              )}
            </p>
          </div>
          
          {lead.type === 'chatbot' && (
            <>
              <div>
                <p className="text-sm font-medium">Dados Físicos</p>
                <p className="text-sm text-gray-600">
                  {(lead as ChatbotLead).age} anos, {(lead as ChatbotLead).height}m, {(lead as ChatbotLead).weight}kg
                  {(lead as ChatbotLead).bmi && <span> (IMC: {(lead as ChatbotLead).bmi.toFixed(1)})</span>}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Objetivo</p>
                <p className="text-sm text-gray-600">{(lead as ChatbotLead).primary_goal}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Experiência</p>
                <p className="text-sm text-gray-600">{(lead as ChatbotLead).experience_level}</p>
              </div>
            </>
          )}
          
          {lead.type === 'contact' && (
            <div className="md:col-span-3">
              <p className="text-sm font-medium">Mensagem</p>
              <p className="text-sm text-gray-600">{(lead as ContactLead).message}</p>
            </div>
          )}
        </div>
        
        {lead.type === 'chatbot' && (lead as ChatbotLead).notes && (
          <div className="mb-4">
            <p className="text-sm font-medium">Notas</p>
            <p className="text-sm text-gray-600">{(lead as ChatbotLead).notes}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Editar Notas
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Notas - {lead.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={editingLead?.notes || (lead.type === 'chatbot' ? (lead as ChatbotLead).notes : '') || ''}
                  onChange={(e) => setEditingLead({ ...lead, notes: e.target.value })}
                  placeholder="Adicione suas notas sobre este lead..."
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => saveLeadNotes(lead.id, editingLead?.notes || '', lead.type)}
                    className="bg-verde-energia hover:bg-verde-energia/90"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={leadToDelete?.id === lead.id} onOpenChange={(open) => !open && setLeadToDelete(null)}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => setLeadToDelete(lead)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setLeadToDelete(null)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteLead(lead)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Confirmar Exclusão
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );

  const handleCleanupLeads = async () => {
    if (!companyId) return;

    try {
      setIsLoading(true);
      const result = await cleanupOldLeads(companyId);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
        loadLeads(); // Recarregar a lista de leads
      } else {
        toast({
          title: "Erro",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao limpar leads antigos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsCleanupDialogOpen(false);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-preto-grafite">Gerenciamento de Leads</h2>
        <div className="flex gap-2">
          <CreateLeadDialog onLeadCreated={loadLeads} />
          <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Limpar Leads Antigos
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Limpeza de Leads</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Esta ação irá excluir permanentemente todos os leads não convertidos com mais de 6 meses de idade.
                  Esta ação não pode ser desfeita.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsCleanupDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleCleanupLeads}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Confirmar Limpeza
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button
            onClick={loadLeads}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Mensagem de limite de leads */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              O limite de leads por empresa é 25. Para aumentar o limite, entre em contato com o suporte.
            </p>
            <Badge variant={allLeads.length >= 25 ? "destructive" : "secondary"}>
              {allLeads.length}/25 leads
            </Badge>
          </div>
          {allLeads.length >= 25 && (
            <p className="text-sm text-red-600 mt-2">
              Você atingiu o limite de 25 leads. Não é possível criar novos leads. Para aumentar o limite, entre em contato com o suporte.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={activeView} onValueChange={(value: 'all' | 'chatbot' | 'contact') => setActiveView(value)}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos ({allLeads.length})</SelectItem>
                <SelectItem value="chatbot">Chatbot ({chatbotLeads.length})</SelectItem>
                <SelectItem value="contact">Formulário ({contactLeads.length})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="NEW">Novo</SelectItem>
                <SelectItem value="CONTACTED">Contatado</SelectItem>
                <SelectItem value="NEGOTIATING">Negociando</SelectItem>
                <SelectItem value="CONVERTED">Convertido</SelectItem>
                <SelectItem value="LOST">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Leads */}
      {filteredLeads.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Nenhum lead encontrado com os filtros aplicados'
                : 'Nenhum lead encontrado'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredLeads.map(renderLeadCard)}
        </div>
      )}
    </div>
  );
};
