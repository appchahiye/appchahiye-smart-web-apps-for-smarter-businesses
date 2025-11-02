import { useContentStore } from '@/stores/contentStore';
export const AppLogo = () => {
  const logoUrl = useContentStore(state => state.content?.brandAssets.logoUrl);
  return (
    <div className="flex items-center">
      {logoUrl ? (
        <img src={logoUrl} alt="AppChahiye Logo" className="h-8 w-auto" />
      ) : (
        <div className="w-7 h-7 bg-gradient-brand rounded-lg" />
      )}
    </div>
  );
};