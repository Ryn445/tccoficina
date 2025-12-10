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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Users, Wrench, Package, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Transacao {
  id: string;
  data: string;
  tipo: string;
  descricao: string;
  valor: string;
  categoria: string;
}

interface Servico {
  id: string;
  total: string;
  status: string;
  cliente_nome: string;
  data: string;
}

interface Funcionario {
  id: string;
  nome: string;
  salario: string;
}

interface Produto {
  id: string;
  nome: string;
  preco: string;
  estoque: number;
}

const parseValor = (valor: string): number => {
  if (!valor) return 0;
  return parseFloat(valor.replace("R$", "").replace(/\./g, "").replace(",", ".").trim()) || 0;
};

const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const Financeiro = () => {
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [transacoesData, servicosData, funcionariosData, produtosData] = await Promise.all([
        supabase.from("transacoes").select("*").order("created_at", { ascending: false }),
        supabase.from("servicos").select("*").order("created_at", { ascending: false }),
        supabase.from("funcionarios").select("*"),
        supabase.from("produtos").select("*")
      ]);

      if (transacoesData.error) throw transacoesData.error;
      if (servicosData.error) throw servicosData.error;
      if (funcionariosData.error) throw funcionariosData.error;
      if (produtosData.error) throw produtosData.error;

      setTransacoes(transacoesData.data || []);
      setServicos(servicosData.data || []);
      setFuncionarios(funcionariosData.data || []);
      setProdutos(produtosData.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    data: "",
    tipo: "",
    descricao: "",
    valor: "",
    categoria: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from("transacoes")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setTransacoes([data, ...transacoes]);
      setFormData({ data: "", tipo: "", descricao: "", valor: "", categoria: "" });
      toast.success("Transação registrada com sucesso!");
    } catch (error) {
      console.error("Erro ao registrar transação:", error);
      toast.error("Erro ao registrar transação");
    }
  };

  // Cálculos das transações manuais
  const receitasTransacoes = transacoes
    .filter(t => t.tipo === "Receita")
    .reduce((acc, t) => acc + parseValor(t.valor), 0);

  const despesasTransacoes = transacoes
    .filter(t => t.tipo === "Despesa")
    .reduce((acc, t) => acc + parseValor(t.valor), 0);

  // Receita dos serviços concluídos
  const receitaServicos = servicos
    .filter(s => s.status === "Concluído")
    .reduce((acc, s) => acc + parseValor(s.total), 0);

  // Total de salários dos funcionários
  const totalSalarios = funcionarios.reduce((acc, f) => acc + parseValor(f.salario), 0);

  // Valor total em estoque
  const valorEstoque = produtos.reduce((acc, p) => acc + (parseValor(p.preco) * p.estoque), 0);

  // Totais gerais
  const totalReceitas = receitasTransacoes + receitaServicos;
  const totalDespesas = despesasTransacoes + totalSalarios;
  const saldoGeral = totalReceitas - totalDespesas;

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Receitas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {formatarMoeda(totalReceitas)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Despesas Totais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {formatarMoeda(totalDespesas)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Saldo Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${saldoGeral >= 0 ? "text-accent" : "text-destructive"}`}>
              {formatarMoeda(saldoGeral)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Serviços Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-accent">{formatarMoeda(receitaServicos)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {servicos.filter(s => s.status === "Concluído").length} serviços
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Folha Salarial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-destructive">{formatarMoeda(totalSalarios)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {funcionarios.length} funcionários
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Valor em Estoque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatarMoeda(valorEstoque)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {produtos.reduce((acc, p) => acc + p.estoque, 0)} itens
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Serviços Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-muted-foreground">
              {formatarMoeda(servicos.filter(s => s.status !== "Concluído").reduce((acc, s) => acc + parseValor(s.total), 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {servicos.filter(s => s.status !== "Concluído").length} em aberto
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Formulário de Transação */}
      <Card>
        <CardHeader>
          <CardTitle>Nova Transação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Receita">Receita</SelectItem>
                    <SelectItem value="Despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Registrar Transação
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico Financeiro</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : (
            <Tabs defaultValue="transacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="transacoes">Transações ({transacoes.length})</TabsTrigger>
                <TabsTrigger value="servicos">Receita de Serviços ({servicos.filter(s => s.status === "Concluído").length})</TabsTrigger>
              </TabsList>
              <TabsContent value="transacoes" className="mt-4">
                {transacoes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhuma transação registrada.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transacoes.map((transacao) => (
                          <TableRow key={transacao.id}>
                            <TableCell>{transacao.data}</TableCell>
                            <TableCell>
                              <span className={transacao.tipo === "Receita" ? "text-accent font-medium" : "text-destructive font-medium"}>
                                {transacao.tipo}
                              </span>
                            </TableCell>
                            <TableCell className="font-medium">{transacao.descricao}</TableCell>
                            <TableCell>{transacao.categoria}</TableCell>
                            <TableCell>{transacao.valor}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="servicos" className="mt-4">
                {servicos.filter(s => s.status === "Concluído").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Nenhum serviço concluído.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {servicos.filter(s => s.status === "Concluído").map((servico) => (
                          <TableRow key={servico.id}>
                            <TableCell>{servico.data}</TableCell>
                            <TableCell className="font-medium">{servico.cliente_nome}</TableCell>
                            <TableCell>
                              <span className="text-accent font-medium">Concluído</span>
                            </TableCell>
                            <TableCell>{servico.total}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;