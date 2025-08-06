import { CURATED_ICONS, IconData } from '../../data/profileIcons';

interface IconPickerProps {
  selectedIconId: string;
  onIconSelect: (iconId: string) => void;
  variant?: 'inline' | 'modal';
  className?: string;
}

const IconPicker = ({
  selectedIconId,
  onIconSelect,
  variant = 'inline',
  className = ''
}: IconPickerProps) => {
  const handleIconClick = (iconId: string) => {
    onIconSelect(iconId);
  };

  const IconGrid = ({ icons }: { icons: IconData[] }) => (
    <div className="grid grid-cols-6 md:grid-cols-8 gap-2 max-h-64 overflow-y-auto">
      {icons.map((iconData) => {
        const IconComponent = iconData.icon;
        return (
          <button
            key={iconData.id}
            type="button"
            onClick={() => handleIconClick(iconData.id)}
            className={`
              group relative w-10 h-10 rounded-lg border-2 transition-all duration-200 
              hover:shadow-md flex items-center justify-center
              bg-light-bg-primary dark:bg-dark-bg-primary
              ${selectedIconId === iconData.id
                ? 'border-light-button-primary dark:border-dark-button-primary shadow-lg'
                : 'border-light-border-primary dark:border-dark-border-primary hover:border-light-button-primary dark:hover:border-dark-button-primary'
              }
            `}
            title={iconData.name}
            aria-label={`Select ${iconData.name} icon`}
          >
            <IconComponent 
              className={`h-5 w-5 ${
                selectedIconId === iconData.id
                  ? 'text-light-button-primary dark:text-dark-button-primary'
                  : 'text-light-text-primary dark:text-dark-text-primary'
              }`}
            />
            {selectedIconId === iconData.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-light-button-primary dark:bg-dark-button-primary rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );

  const content = (
    <div className={className}>
      <IconGrid icons={CURATED_ICONS} />
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary p-4 shadow-lg max-w-sm w-full">
        {content}
      </div>
    );
  }

  return content;
};

export default IconPicker;