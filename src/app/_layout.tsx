import { Stack } from "expo-router";
import "../i18n";


export default function RootLayout() {
//   useEffect(() => {
//   const checkAuth = async () => {
//     const token = await getItem("token");

//     if (token) {
//       router.replace("/");
//     }
//   };

//   checkAuth();
// }, []);
  return (
    
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="about" />
      <Stack.Screen name="contact" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="complaints" />
      <Stack.Screen name="explore" />
      <Stack.Screen name="qa" />
    </Stack>
    
  );
}