import IconPicker from './IconPicker';
import Avatar from './Avatar';
import { DEFAULT_ICON } from '../../data/profileIcons';

interface AvatarPickerProps {
  selectedIconId?: string;
  onIconSelect: (iconId: string) => void;
  variant?: 'inline' | 'modal';
  className?: string;
}

const AvatarPicker = ({
  selectedIconId = DEFAULT_ICON.id,
  onIconSelect,
  variant = 'inline',
  className = ''
}: AvatarPickerProps) => {
  const PreviewSection = () => (
    <div className="flex items-center gap-4 mb-4 p-3 bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-lg">
      <div className="text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
        Preview:
      </div>
      <div className="flex items-center gap-2">
        <Avatar size="sm" iconId={selectedIconId} />
        <Avatar size="md" iconId={selectedIconId} />
        <Avatar size="lg" iconId={selectedIconId} />
      </div>
    </div>
  );

  const content = (
    <div className={`space-y-4 ${className}`}>
      <PreviewSection />
      <IconPicker
        selectedIconId={selectedIconId}
        onIconSelect={onIconSelect}
        variant="inline"
      />
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="bg-light-bg-primary dark:bg-dark-bg-secondary rounded-xl border border-light-border-primary dark:border-dark-border-primary p-4 shadow-lg max-w-md w-full">
        {content}
      </div>
    );
  }

  return content;
};

export default AvatarPicker;