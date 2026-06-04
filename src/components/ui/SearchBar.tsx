import { Icon } from './Icon';

export function SearchBar({
  placeholder = 'Search…',
  value,
  onChange,
}: {
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="search-bar">
      <span className="si">
        <Icon name="search" size={15} />
      </span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
    </div>
  );
}
