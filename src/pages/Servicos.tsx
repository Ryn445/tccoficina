import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Servico {
  id: string;
  data: string;
  cliente_id: string | null;
  cliente_nome: string;
  status: string;
  responsavel: string;
  responsavel_id: string | null;
  km_veiculo: string | null;
  descricao: string | null;
  total: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface Funcionario {
  id: string;
  nome: string;
}

const Servicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [servicosData, clientesData, funcionariosData] = await Promise.all([
        supabase.from("servicos").select("*").order("created_at", { ascending: false }),
        supabase.from("clientes").select("id, nome").order("nome"),
        supabase.from("funcionarios").select("id, nome").order("nome")
      ]);

      if (servicosData.error) throw servicosData.error;
      if (clientesData.error) throw clientesData.error;
      if (funcionariosData.error) throw funcionariosData.error;

      setServicos(servicosData.data || []);
      setClientes(clientesData.data || []);
      setFuncionarios(funcionariosData.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    data: "",
    cliente_id: "",
    status: "",
    responsavel_id: "",
    kmVeiculo: "",
    descricao: "",
    valor: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const clienteSelecionado = clientes.find(c => c.id === formData.cliente_id);
      const funcionarioSelecionado = funcionarios.find(f => f.id === formData.responsavel_id);
      
      const { data, error } = await supabase
        .from("servicos")
        .insert([{
          data: formData.data,
          cliente_id: formData.cliente_id || null,
          cliente_nome: clienteSelecionado?.nome || "",
          status: formData.status,
          responsavel: funcionarioSelecionado?.nome || "",
          responsavel_id: formData.responsavel_id || null,
          km_veiculo: formData.kmVeiculo,
          descricao: formData.descricao,
          total: formData.valor,
        }])
        .select()
        .single();

      if (error) throw error;

      setServicos([data, ...servicos]);
      setFormData({ data: "", cliente_id: "", status: "", responsavel_id: "", kmVeiculo: "", descricao: "", valor: "" });
      toast.success("Serviço registrado com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar serviço:", error);
      toast.error("Erro ao registrar serviço");
    }
  };

  const atualizarStatus = async (servicoId: string, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from("servicos")
        .update({ status: novoStatus })
        .eq("id", servicoId);

      if (error) throw error;

      setServicos(servicos.map(s => 
        s.id === servicoId ? { ...s, status: novoStatus } : s
      ));
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      "Aberto": "outline",
      "Em Andamento": "secondary",
      "Concluído": "default",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const servicosAbertos = servicos.filter(s => s.status === "Aberto");
  const servicosEmAndamento = servicos.filter(s => s.status === "Em Andamento");
  const servicosConcluidos = servicos.filter(s => s.status === "Concluído");

  const renderTabela = (lista: Servico[]) => (
    lista.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">Nenhum serviço nesta categoria.</div>
    ) : (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Alterar Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lista.map((servico) => (
              <TableRow key={servico.id}>
                <TableCell>{servico.data}</TableCell>
                <TableCell className="font-medium">{servico.cliente_nome}</TableCell>
                <TableCell>{getStatusBadge(servico.status)}</TableCell>
                <TableCell>{servico.responsavel}</TableCell>
                <TableCell>{servico.total}</TableCell>
                <TableCell>
                  <Select
                    value={servico.status}
                    onValueChange={(value) => atualizarStatus(servico.id, value)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                      <SelectItem value="Concluído">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Serviço / OS</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data}
                  onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Select value={formData.cliente_id} onValueChange={(value) => setFormData({ ...formData, cliente_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cliente" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientes.length === 0 ? (
                      <SelectItem value="vazio" disabled>Cadastre clientes primeiro</SelectItem>
                    ) : (
                      clientes.map((cliente) => (
                        <SelectItem key={cliente.id} value={cliente.id}>{cliente.nome}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável (Funcionário)</Label>
                <Select value={formData.responsavel_id} onValueChange={(value) => setFormData({ ...formData, responsavel_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {funcionarios.length === 0 ? (
                      <SelectItem value="vazio" disabled>Cadastre funcionários primeiro</SelectItem>
                    ) : (
                      funcionarios.map((func) => (
                        <SelectItem key={func.id} value={func.id}>{func.nome}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aberto">Aberto</SelectItem>
                    <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                    <SelectItem value="Concluído">Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kmVeiculo">KM do Veículo</Label>
                <Input
                  id="kmVeiculo"
                  value={formData.kmVeiculo}
                  onChange={(e) => setFormData({ ...formData, kmVeiculo: e.target.value })}
                  placeholder="KM"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor Total</Label>
                <Input
                  id="valor"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição do Serviço</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descreva o serviço realizado"
              />
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Salvar Serviço
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Serviços Registrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando serviços...</div>
          ) : (
            <Tabs defaultValue="todos" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="todos">Todos ({servicos.length})</TabsTrigger>
                <TabsTrigger value="abertos">Abertos ({servicosAbertos.length})</TabsTrigger>
                <TabsTrigger value="andamento">Em Andamento ({servicosEmAndamento.length})</TabsTrigger>
                <TabsTrigger value="concluidos">Concluídos ({servicosConcluidos.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="todos" className="mt-4">
                {renderTabela(servicos)}
              </TabsContent>
              <TabsContent value="abertos" className="mt-4">
                {renderTabela(servicosAbertos)}
              </TabsContent>
              <TabsContent value="andamento" className="mt-4">
                {renderTabela(servicosEmAndamento)}
              </TabsContent>
              <TabsContent value="concluidos" className="mt-4">
                {renderTabela(servicosConcluidos)}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicos;