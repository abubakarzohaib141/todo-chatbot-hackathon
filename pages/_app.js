import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import ChatbotButton from '../components/ChatbotButton';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
      <ChatbotButton />
    </AuthProvider>
  );
}
