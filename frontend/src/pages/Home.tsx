import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="text-white p-6">
      <h1 className="text-3xl font-bold">{t('nav_inicio')}</h1>
    </div>
  );
}