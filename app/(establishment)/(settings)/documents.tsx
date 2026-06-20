import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const PRIMARY = "#782726";

type Establishment = {
  id: string;
  terms_url: string | null;
  partnership_contract_url: string | null;
};

type DocumentStatus = {
  operatingLicense: string | null;
  hygieneCertificate: string | null;
};

type SupabaseDoc = {
  document_type: string;
  file_url: string | null;
};

export default function Documents() {
  const [loading, setLoading] = useState(true);
  const [establishment, setEstablishment] = useState<Establishment | null>(
    null,
  );

  const [documents, setDocuments] = useState<DocumentStatus>({
    operatingLicense: null,
    hygieneCertificate: null,
  });

  const loadDocuments = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Buscar establishment com URLs
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("id, terms_url, partnership_contract_url")
        .eq("user_id", user.id)
        .single();

      if (estError) {
        console.error(estError);
        return;
      }

      if (!estData) return;

      setEstablishment(estData);

      // Buscar documentos da tabela establishment_documents
      const { data, error } = await supabase
        .from("establishment_documents")
        .select("document_type, file_url")
        .eq("establishment_id", estData.id);

      if (error) {
        console.error(error);
        return;
      }

      const docs = (data ?? []) as SupabaseDoc[];

      const operatingLicense = docs.find(
        (d) => d.document_type === "operating_license",
      );

      const hygieneCertificate = docs.find(
        (d) => d.document_type === "hygiene_certificate",
      );

      setDocuments({
        operatingLicense: operatingLicense?.file_url ?? null,
        hygieneCertificate: hygieneCertificate?.file_url ?? null,
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        await loadDocuments();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, []);

  const openDocument = async (url?: string | null) => {
    try {
      if (!url) {
        Alert.alert(
          "Documento indisponível",
          "Este documento ainda não foi carregado.",
        );
        return;
      }

      await Linking.openURL(url);
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Não foi possível abrir o documento.");
    }
  };

  const docs = [
    {
      title: "Contrato de Parceria",
      description: "Contrato assinado entre o estabelecimento e a plataforma",
      available: !!establishment?.partnership_contract_url,
      url: establishment?.partnership_contract_url,
    },
    {
      title: "Termos e Condições",
      description: "Termos gerais da plataforma",
      available: !!establishment?.terms_url,
      url: establishment?.terms_url,
    },
    {
      title: "Licença de Funcionamento",
      description: "Documento obrigatório para operar na plataforma",
      available: !!documents.operatingLicense,
      url: documents.operatingLicense,
    },
    {
      title: "Certificado de Higiene",
      description: "Comprovativo de conformidade sanitária",
      available: !!documents.hygieneCertificate,
      url: documents.hygieneCertificate,
    },
  ];

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Documentos</Text>

      <Text style={styles.subtitle}>
        Consulte os documentos legais e os ficheiros obrigatórios do seu
        estabelecimento.
      </Text>

      {docs.map((doc) => (
        <Pressable
          key={doc.title}
          style={styles.card}
          onPress={() => openDocument(doc.url)}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📄</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.cardTitle}>{doc.title}</Text>
            <Text style={styles.description}>{doc.description}</Text>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: doc.available ? "#DCFCE7" : "#FEE2E2",
                },
              ]}
            >
              <Text
                style={{
                  color: doc.available ? "#166534" : "#991B1B",
                  fontWeight: "600",
                  fontSize: 12,
                }}
              >
                {doc.available ? "Disponível" : "Em falta"}
              </Text>
            </View>
          </View>

          <Text style={styles.arrow}>›</Text>
        </Pressable>
      ))}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Informação</Text>

        <Text style={styles.infoText}>
          Alguns documentos são obrigatórios para manter a conta ativa na
          plataforma. Caso algum documento esteja em falta ou expirado, poderá
          ser solicitado novamente.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  subtitle: {
    color: "#666",
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 22,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 3,
  },
  description: {
    color: "#666",
    fontSize: 13,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  arrow: {
    fontSize: 24,
    color: "#999",
  },
  infoCard: {
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    padding: 15,
    marginTop: 10,
    marginBottom: 30,
  },
  infoTitle: {
    fontWeight: "700",
    marginBottom: 8,
    color: PRIMARY,
  },
  infoText: {
    color: "#555",
    lineHeight: 20,
  },
});
