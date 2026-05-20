export type BrandId = "arraia" | "roque-pinto" | "cachoeira-colonial";

export interface Product {
  id: string;
  nome: string;
  preco: number;
  categoria: string;
}

export interface Brand {
  id: BrandId;
  nome: string;
  cor: string;
  cidade?: string;
  categorias: { nome: string; produtos: Omit<Product, "id" | "categoria">[] }[];
}

export interface CartItem {
  productId: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Order {
  id: string;
  clienteNome: string;
  marcaId: BrandId;
  marcaNome: string;
  itens: CartItem[];
  total: number;
  observacao: string;
  criadoEm: Date;
  concluido: boolean;
  cancelado: boolean;
  criadoPor?: string;
}

export type OrderStatus = "pendente" | "vendido" | "cancelado" | "todos";

export type AppView = "novo" | "pedidos" | "resumo" | "catalogo";
