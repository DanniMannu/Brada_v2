import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Invoice = {
  id: string;
  reference: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function Invoices() {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  const loadInvoices = async () => {
    try {
      // TODO: substituir pela query Supabase

      const mockData: Invoice[] = [
        {
          id: "1",
          reference: "FAT-2025-001",
          amount: 2500,
          status: "Pago",
          created_at: "2025-07-01",
        },
        {
          id: "2",
          reference: "FAT-2025-002",
          amount: 1800,
          status: "Pago",
          created_at: "2025-07-05",
        },
      ];

      setInvoices(mockData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      await loadInvoices();
    };

    fetchInvoices();
  }, []);

  const renderInvoice = ({ item }: { item: Invoice }) => (
    <View style={styles.card}>
      <Text style={styles.reference}>{item.reference}</Text>

      <Text style={styles.amount}>{item.amount.toLocaleString()} MT</Text>

      <Text style={styles.status}>{item.status}</Text>

      <Text style={styles.date}>
        {new Date(item.created_at).toLocaleDateString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Faturas</Text>

      <FlatList
        data={invoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhuma fatura encontrada.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
  },

  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },

  reference: {
    fontSize: 16,
    fontWeight: "700",
  },

  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 5,
    color: "#782726",
  },

  status: {
    marginTop: 5,
    fontSize: 14,
  },

  date: {
    marginTop: 5,
    color: "#666",
    fontSize: 12,
  },

  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },

  emptyText: {
    color: "#666",
  },
});
