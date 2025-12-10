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
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Cliente {
  id: string;
  nome: string;
  cpf: string | null;
  telefone: string;
  data_nascimento: string | null;
  email: string;
  veiculo: string;
  placa_veiculo: string | null;
  ano_veiculo: string | null;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarClientes();
  }, []);

  const carregarClientes = async () => {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      toast.error("Erro ao carregar clientes");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    data_nascimento: "",
    email: "",
    veiculo: "",
    placa_veiculo: "",
    ano_veiculo: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setClientes([data, ...clientes]);
      setFormData({ 
        nome: "", 
        cpf: "", 
        telefone: "", 
        data_nascimento: "", 
        email: "", 
        veiculo: "", 
        placa_veiculo: "", 
        ano_veiculo: "" 
      });
      toast.success("Cliente adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast.error("Erro ao adicionar cliente");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="veiculo">Veículo</Label>
                <Input
                  id="veiculo"
                  value={formData.veiculo}
                  onChange={(e) => setFormData({ ...formData, veiculo: e.target.value })}
                  placeholder="Marca e Modelo"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa_veiculo">Placa do Veículo</Label>
                <Input
                  id="placa_veiculo"
                  value={formData.placa_veiculo}
                  onChange={(e) => setFormData({ ...formData, placa_veiculo: e.target.value })}
                  placeholder="ABC-1234"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano_veiculo">Ano do Veículo</Label>
                <Input
                  id="ano_veiculo"
                  value={formData.ano_veiculo}
                  onChange={(e) => setFormData({ ...formData, ano_veiculo: e.target.value })}
                  placeholder="2024"
                />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Salvar Cliente
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando clientes...</div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum cliente cadastrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Ano</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientes.map((cliente) => (
                    <TableRow key={cliente.id}>
                      <TableCell className="font-medium">{cliente.nome}</TableCell>
                      <TableCell>{cliente.cpf || "-"}</TableCell>
                      <TableCell>{cliente.telefone}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell>{cliente.veiculo}</TableCell>
                      <TableCell>{cliente.placa_veiculo || "-"}</TableCell>
                      <TableCell>{cliente.ano_veiculo || "-"}</TableCell>
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

export default Clientes;