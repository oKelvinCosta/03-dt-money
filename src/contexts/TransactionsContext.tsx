import { createContext } from "react";
import { useEffect, useState } from "react";
import { api } from "../lib/axios";

interface CreateTransactionInput {
  description: string;
  type: "income" | "outcome";
  price: number;
  category: string;
}

interface Transaction {
  id: number;
  description: string;
  type: "income" | "outcome";
  price: number;
  category: string;
  createdAt: string;
}

interface TransactionsContextType {
  transactions: Transaction[];
  fetchTransactions: (query?: string) => Promise<void>;
  createTransaction: (data: CreateTransactionInput) => Promise<void>;
}

export const TransactionsContext = createContext({} as TransactionsContextType);

export function TransactionsProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // This function is used in context because limit the other components to use, it is more secure
  async function createTransaction(data: CreateTransactionInput) {
    const { description, price, category, type } = data;
    const response = await api.post("/transactions", {
      description,
      price,
      category,
      type,
      createdAt: new Date(),
    });

    // To update a state is better use callback to not lost any item
    setTransactions((prevTransactions) => [response.data, ...prevTransactions]);
  }

  // If I use fetch here, it'll update every time that the component/father is re-rendered. It's not the best way to do it.
  // fetch("http://localhost:3333/transactions").then((response) => {
  //   console.log(response);
  // });

  // Using FETCH
  // async function fetchTransactions(query?: string) {
  //   const url = new URL("http://localhost:3000/transactions");

  //   if (query) {
  //     url.searchParams.set("q", query);
  //   }
  //   const response = await fetch(url);

  //   const data = await response.json();
  //   console.log("fetch", data);
  //   setTransactions(data);
  // }

  // Using AXIOS
  async function fetchTransactions(query?: string) {
    const response = await api.get("/transactions", {
      params: {
        _sort: "createdAt",
        _order: "desc",
        q: query,
      },
    });
    setTransactions(response.data);
  }

  useEffect(() => {
    // fetch("http://localhost:3333/transactions").then((response) => {
    //   response.json().then((data) => {
    //     console.log(data);
    //   });
    // });

    // More elegant way:
    // fetch("http://localhost:3333/transactions")
    //   .then((response) => response.json())
    //   .then((data) => console.log(data));

    // UseEffect can not be async

    fetchTransactions();
  }, []);
  return (
    <TransactionsContext.Provider value={{ transactions, fetchTransactions, createTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}
