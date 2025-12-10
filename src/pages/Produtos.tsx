import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Minus } from "lucide-react";

interface Produto {
  id: string;
  nome: string;
  categoria: string;
  preco: string;
  estoque: number;
}

const Produtos = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [movimentacao, setMovimentacao] = useState({ tipo: "", quantidade: "", motivo: "" });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nome: "",
    categoria: "",
    preco: "",
    estoque: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from("produtos")
        .insert([{
          ...formData,
          estoque: Number(formData.estoque)
        }])
        .select()
        .single();

      if (error) throw error;

      setProdutos([data, ...produtos]);
      setFormData({ nome: "", categoria: "", preco: "", estoque: "" });
      toast.success("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      toast.error("Erro ao adicionar produto");
    }
  };

  const handleMovimentacao = async () => {
    if (!produtoSelecionado || !movimentacao.tipo || !movimentacao.quantidade) {
      toast.error("Preencha todos os campos");
      return;
    }

    const quantidade = Number(movimentacao.quantidade);
    const novoEstoque = movimentacao.tipo === "entrada" 
      ? produtoSelecionado.estoque + quantidade 
      : produtoSelecionado.estoque - quantidade;

    if (novoEstoque < 0) {
      toast.error("Estoque não pode ficar negativo");
      return;
    }

    try {
      // Registrar movimentação
      await supabase
        .from("movimentacoes_estoque")
        .insert([{
          produto_id: produtoSelecionado.id,
          tipo: movimentacao.tipo,
          quantidade: quantidade,
          motivo: movimentacao.motivo
        }]);

      // Atualizar estoque do produto
      const { error } = await supabase
        .from("produtos")
        .update({ estoque: novoEstoque })
        .eq("id", produtoSelecionado.id);

      if (error) throw error;

      setProdutos(produtos.map(p => 
        p.id === produtoSelecionado.id ? { ...p, estoque: novoEstoque } : p
      ));
      
      setMovimentacao({ tipo: "", quantidade: "", motivo: "" });
      setProdutoSelecionado(null);
      setDialogOpen(false);
      toast.success(`Estoque ${movimentacao.tipo === "entrada" ? "adicionado" : "retirado"} com sucesso!`);
    } catch (error) {
      console.error("Erro ao movimentar estoque:", error);
      toast.error("Erro ao movimentar estoque");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
              <div className="space-y-2">
                <Label htmlFor="preco">Preço</Label>
                <Input
                  id="preco"
                  value={formData.preco}
                  onChange={(e) => setFormData({ ...formData, preco: e.target.value })}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque Inicial</Label>
                <Input
                  id="estoque"
                  type="number"
                  value={formData.estoque}
                  onChange={(e) => setFormData({ ...formData, estoque: e.target.value })}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Salvar Produto
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando produtos...</div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum produto cadastrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Estoque</TableHead>
                    <TableHead>Movimentar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto) => (
                    <TableRow key={produto.id}>
                      <TableCell className="font-medium">{produto.nome}</TableCell>
                      <TableCell>{produto.categoria}</TableCell>
                      <TableCell>{produto.preco}</TableCell>
                      <TableCell>
                        <span className={produto.estoque <= 5 ? "text-destructive font-medium" : ""}>
                          {produto.estoque}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog open={dialogOpen && produtoSelecionado?.id === produto.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) {
                            setProdutoSelecionado(null);
                            setMovimentacao({ tipo: "", quantidade: "", motivo: "" });
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setProdutoSelecionado(produto)}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              <Minus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Movimentar Estoque - {produto.nome}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="text-sm text-muted-foreground">
                                Estoque atual: <span className="font-medium text-foreground">{produto.estoque}</span>
                              </div>
                              <div className="space-y-2">
                                <Label>Tipo de Movimentação</Label>
                                <Select 
                                  value={movimentacao.tipo} 
                                  onValueChange={(value) => setMovimentacao({ ...movimentacao, tipo: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="entrada">Entrada (Adicionar)</SelectItem>
                                    <SelectItem value="saida">Saída (Retirar)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Quantidade</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={movimentacao.quantidade}
                                  onChange={(e) => setMovimentacao({ ...movimentacao, quantidade: e.target.value })}
                                  placeholder="0"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Motivo (opcional)</Label>
                                <Input
                                  value={movimentacao.motivo}
                                  onChange={(e) => setMovimentacao({ ...movimentacao, motivo: e.target.value })}
                                  placeholder="Ex: Venda, Reposição, Perda..."
                                />
                              </div>
                              <Button 
                                onClick={handleMovimentacao} 
                                className="w-full bg-accent hover:bg-accent/90"
                              >
                                Confirmar Movimentação
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Produtos;