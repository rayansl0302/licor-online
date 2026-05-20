import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { auth } from "./auth";
import { db } from "./firebase";
import { getFirestoreErrorMessage } from "./firestoreErrors";
import type { BrandId, CartItem, Order, OrderOrigem } from "../types";

const COLLECTION = "pedidos";
const PUBLIC_ORIGEM: OrderOrigem = "cliente-publico";

interface OrderFirestore {
  clienteNome: string;
  marcaId: BrandId;
  marcaNome: string;
  itens: CartItem[];
  total: number;
  observacao: string;
  criadoEm: Timestamp;
  concluido: boolean;
  cancelado: boolean;
  criadoPor?: string;
  origem?: OrderOrigem;
}

function mapDoc(id: string, data: OrderFirestore): Order {
  return {
    id,
    clienteNome: data.clienteNome,
    marcaId: data.marcaId,
    marcaNome: data.marcaNome,
    itens: data.itens,
    total: data.total,
    observacao: data.observacao ?? "",
    criadoEm: data.criadoEm?.toDate?.() ?? new Date(0),
    concluido: data.concluido ?? false,
    cancelado: data.cancelado ?? false,
    criadoPor: data.criadoPor,
    origem: data.origem,
  };
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort(
    (a, b) => b.criadoEm.getTime() - a.criadoEm.getTime()
  );
}

export function subscribeOrders(
  onData: (orders: Order[]) => void,
  onError: (message: string) => void
) {
  const col = collection(db, COLLECTION);

  return onSnapshot(
    col,
    (snapshot) => {
      const orders = sortOrders(
        snapshot.docs.map((d) => mapDoc(d.id, d.data() as OrderFirestore))
      );
      onData(orders);
      onError("");
    },
    (err) => {
      onError(getFirestoreErrorMessage(err));
      onData([]);
    }
  );
}

export async function saveOrder(input: {
  clienteNome: string;
  marcaId: BrandId;
  marcaNome: string;
  itens: CartItem[];
  total: number;
  observacao: string;
}): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("auth/user-not-signed-in");
  }

  await addDoc(collection(db, COLLECTION), {
    ...input,
    concluido: false,
    cancelado: false,
    criadoEm: serverTimestamp(),
    criadoPor: uid,
    origem: "admin",
  });
}

export async function savePublicOrder(input: {
  clienteNome: string;
  marcaId: BrandId;
  marcaNome: string;
  itens: CartItem[];
  total: number;
  observacao: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    concluido: false,
    cancelado: false,
    criadoEm: serverTimestamp(),
    origem: PUBLIC_ORIGEM,
  });

  return docRef.id;
}

export async function toggleOrderDone(id: string, concluido: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    concluido,
    cancelado: false,
  });
}

export async function cancelOrder(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    cancelado: true,
    concluido: false,
  });
}

export async function reopenOrder(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    cancelado: false,
    concluido: false,
  });
}

export async function updateOrder(
  id: string,
  input: {
    clienteNome: string;
    marcaId: BrandId;
    marcaNome: string;
    itens: CartItem[];
    total: number;
    observacao: string;
  }
): Promise<void> {
  if (!auth.currentUser?.uid) {
    throw new Error("auth/user-not-signed-in");
  }

  await updateDoc(doc(db, COLLECTION, id), input);
}

export { getFirestoreErrorMessage };
