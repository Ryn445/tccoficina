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

interface Funcionario {
  id: string;
  nome: string;
  cpf: string | null;
  cargo: string;
  telefone: string;
  email: string | null;
  data_nascimento: string | null;
  endereco: string | null;
  salario: string;
}

const Funcionarios = () => {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    carregarFuncionarios();
  }, []);

  const carregarFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from("funcionarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    cargo: "",
    telefone: "",
    email: "",
    data_nascimento: "",
    endereco: "",
    salario: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from("funcionarios")
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      setFuncionarios([data, ...funcionarios]);
      setFormData({ 
        nome: "", 
        cpf: "", 
        cargo: "", 
        telefone: "", 
        email: "", 
        data_nascimento: "", 
        endereco: "", 
        salario: "" 
      });
      toast.success("Funcionário adicionado com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar funcionário:", error);
      toast.error("Erro ao adicionar funcionário");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Novo Funcionário</CardTitle>
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
                <Label htmlFor="cargo">Cargo</Label>
                <Input
                  id="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  required
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
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  placeholder="Rua, número, bairro"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salario">Salário</Label>
                <Input
                  id="salario"
                  value={formData.salario}
                  onChange={(e) => setFormData({ ...formData, salario: e.target.value })}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
            </div>
            <Button type="submit" className="bg-accent hover:bg-accent/90">
              Salvar Funcionário
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionários Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando funcionários...</div>
          ) : funcionarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum funcionário cadastrado ainda.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CPF</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Salário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {funcionarios.map((funcionario) => (
                    <TableRow key={funcionario.id}>
                      <TableCell className="font-medium">{funcionario.nome}</TableCell>
                      <TableCell>{funcionario.cpf || "-"}</TableCell>
                      <TableCell>{funcionario.cargo}</TableCell>
                      <TableCell>{funcionario.telefone}</TableCell>
                      <TableCell>{funcionario.email || "-"}</TableCell>
                      <TableCell>{funcionario.salario}</TableCell>
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

export default Funcionarios;