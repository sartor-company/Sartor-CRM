import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowUp,
  Ban,
  Banknote,
  BarChart3,
  Bell,
  Building2,
  Camera,
  Car,
  Check,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  Clock,
  Compass,
  CreditCard,
  DollarSign,
  Download,
  Eye,
  Factory,
  FileText,
  Hash,
  Home,
  Image,
  Inbox,
  Info,
  Kanban,
  Link2,
  Lock,
  MapPin,
  Medal,
  Package,
  Paperclip,
  Pencil,
  Phone,
  Pill,
  QrCode,
  ScrollText,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Trash2,
  TrendingUp,
  Trophy,
  Undo2,
  Upload,
  User,
  UserCog,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import type { IconName } from '../../types/icons';
import type { CSSProperties, ReactNode } from 'react';

export type { IconName } from '../../types/icons';

const ICONS: Record<IconName, LucideIcon> = {
  home: Home,
  pipeline: Kanban,
  users: Users,
  star: Star,
  clipboard: ClipboardList,
  inbox: Inbox,
  banknote: Banknote,
  dollar: DollarSign,
  undo: Undo2,
  upload: Upload,
  package: Package,
  factory: Factory,
  car: Car,
  bell: Bell,
  hash: Hash,
  building: Building2,
  store: Store,
  search: Search,
  user: User,
  chart: BarChart3,
  settings: Settings,
  link: Link2,
  lock: Lock,
  'map-pin': MapPin,
  camera: Camera,
  alert: AlertTriangle,
  check: Check,
  download: Download,
  eye: Eye,
  pencil: Pencil,
  trash: Trash2,
  ban: Ban,
  wrench: Wrench,
  'credit-card': CreditCard,
  clock: Clock,
  'trending-up': TrendingUp,
  scroll: ScrollText,
  trophy: Trophy,
  medal: Medal,
  image: Image,
  'file-text': FileText,
  cart: ShoppingCart,
  'arrow-up': ArrowUp,
  pill: Pill,
  hospital: Building2,
  phone: Phone,
  'qr-code': QrCode,
  sparkles: Sparkles,
  info: Info,
  x: X,
  compass: Compass,
  paperclip: Paperclip,
  'circle-alert': CircleAlert,
  'user-cog': UserCog,
  'chevron-down': ChevronDown,
};

export function Icon({
  name,
  size = 16,
  className = '',
  style,
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  className?: string;
  style?: CSSProperties;
  strokeWidth?: number;
}) {
  const Comp = ICONS[name];
  if (!Comp) return null;
  return (
    <Comp
      size={size}
      strokeWidth={strokeWidth}
      className={`sartor-icon ${className}`.trim()}
      style={style}
      aria-hidden
    />
  );
}

/** Icon with optional label (buttons, tabs, table cells). */
export function IconLabel({
  icon,
  children,
  size = 14,
  gap = 6,
  className = '',
}: {
  icon: IconName;
  children: ReactNode;
  size?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <span className={`icon-label ${className}`.trim()} style={{ display: 'inline-flex', alignItems: 'center', gap }}>
      <Icon name={icon} size={size} />
      <span>{children}</span>
    </span>
  );
}
