import { PageTransitionProvider } from './components/PageTransitionProvider';

type AppProps = {
  initialPage: {
    key: string;
    html: string;
    className: string;
  };
};

export function App({ initialPage }: AppProps) {
  return <PageTransitionProvider initialPage={initialPage} />;
}