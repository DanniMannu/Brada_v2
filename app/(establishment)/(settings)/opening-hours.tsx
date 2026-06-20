import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

const PRIMARY = "#782726";

type DaySchedule = {
  closed: boolean;
  openMorning: string;
  closeMorning: string;
  openAfternoon: string;
  closeAfternoon: string;
};

const days = [
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
  "Domingo",
];

export default function OpeningHours() {
  const [loading, setLoading] = useState(true);
  const [vacation, setVacation] = useState(false);

  const [hours, setHours] = useState(
    days.map(() => ({
      closed: false,
      openMorning: "08:00",
      closeMorning: "12:00",
      openAfternoon: "13:00",
      closeAfternoon: "22:00",
    })),
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        const { data } = await supabase
          .from("establishments")
          .select("vacation_mode, opening_hours")
          .eq("user_id", user.id)
          .single();

        if (data?.vacation_mode !== undefined) {
          setVacation(data.vacation_mode);
        }

        if (data?.opening_hours) {
          const loaded = days.map(
            (day) =>
              data.opening_hours[day] || {
                closed: false,
                openMorning: "08:00",
                closeMorning: "12:00",
                openAfternoon: "13:00",
                closeAfternoon: "22:00",
              },
          );

          setHours(loaded);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const updateHour = (
    index: number,
    field: string,
    value: string | boolean,
  ) => {
    const copy = [...hours];

    copy[index] = {
      ...copy[index],
      [field]: value,
    };

    setHours(copy);
  };

  const save = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const openingHours: Record<string, DaySchedule> = {};

      days.forEach((day, index) => {
        openingHours[day] = hours[index];
      });

      const { error } = await supabase
        .from("establishments")
        .update({
          vacation_mode: vacation,
          opening_hours: openingHours,
        })
        .eq("user_id", user.id);

      if (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível guardar");
        return;
      }

      Alert.alert("Sucesso", "Horário atualizado");
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Ocorreu um erro");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Horário de Funcionamento</Text>

      <View style={styles.vacationCard}>
        <View>
          <Text style={styles.vacationTitle}>Modo Férias</Text>
          <Text style={styles.vacationSubtitle}>
            Ocultar estabelecimento temporariamente
          </Text>
        </View>

        <Switch value={vacation} onValueChange={setVacation} />
      </View>

      {days.map((day, index) => (
        <View key={day} style={styles.card}>
          <View style={styles.dayHeader}>
            <Text style={styles.day}>{day}</Text>

            <Switch
              value={!hours[index].closed}
              onValueChange={(value) => updateHour(index, "closed", !value)}
            />
          </View>

          {!hours[index].closed && (
            <>
              <Text style={styles.section}>Manhã</Text>

              <View style={styles.row}>
                <TextInput
                  style={styles.halfInput}
                  value={hours[index].openMorning}
                  onChangeText={(v) => updateHour(index, "openMorning", v)}
                  placeholder="08:00"
                />

                <TextInput
                  style={styles.halfInput}
                  value={hours[index].closeMorning}
                  onChangeText={(v) => updateHour(index, "closeMorning", v)}
                  placeholder="12:00"
                />
              </View>

              <Text style={styles.section}>Tarde</Text>

              <View style={styles.row}>
                <TextInput
                  style={styles.halfInput}
                  value={hours[index].openAfternoon}
                  onChangeText={(v) => updateHour(index, "openAfternoon", v)}
                  placeholder="13:00"
                />

                <TextInput
                  style={styles.halfInput}
                  value={hours[index].closeAfternoon}
                  onChangeText={(v) => updateHour(index, "closeAfternoon", v)}
                  placeholder="22:00"
                />
              </View>
            </>
          )}
        </View>
      ))}

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Guardar Horário</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
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
    marginBottom: 20,
  },

  vacationCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  vacationTitle: {
    fontWeight: "700",
    fontSize: 16,
  },

  vacationSubtitle: {
    color: "#666",
    marginTop: 4,
    fontSize: 12,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
  },

  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  day: {
    fontSize: 16,
    fontWeight: "700",
  },

  section: {
    marginTop: 12,
    marginBottom: 8,
    fontWeight: "600",
    color: "#666",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
  },

  button: {
    backgroundColor: PRIMARY,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 20,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});
