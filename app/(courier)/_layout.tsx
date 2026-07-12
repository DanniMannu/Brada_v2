// app/(entregador)/_layout.tsx
import { Drawer } from "expo-router/drawer";
export default function EntregadorLayout() {
  return (
    <Drawer>
      <Drawer.Screen name="index" options={{ title: "Ínicio" }} />
      <Drawer.Screen name="earnings" options={{ title: "Ganhos" }} />
      <Drawer.Screen name="history" options={{ title: "Histórico" }} />
      <Drawer.Screen name="settings/index" options={{ title: "Conta" }} />
      <Drawer.Screen name="help" options={{ title: "Ajuda e Suporte" }} />
      <Drawer.Screen name="logout" options={{ title: "Terminar Sessão" }} />
      <Drawer.Screen
        name="profile"
        options={{
          title: "Informações pessoais",
          drawerItemStyle: { display: "none" },
        }}
      />
      <Drawer.Screen
        name="settings/payments"
        options={{ title: "Pagamentos", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="orders"
        options={{ title: "Pedidos", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="settings/security"
        options={{ title: "Segurança", drawerItemStyle: { display: "none" } }}
      />
      <Drawer.Screen
        name="settings/notifications"
        options={{ title: "Notificação", drawerItemStyle: { display: "none" } }}
      />

      {/* Esconde do menu mas a rota existe e pode ser aberta via router.push */}
      <Drawer.Screen
        name="reportProblem" // <- corresponde ao ficheiro app/(courier)/reportProblem.tsx
        options={{
          title: "Reportar problema",
          drawerItemStyle: { display: "none" },
        }}
      />
    </Drawer>
  );
}
