import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Users, HardHat, CreditCard,
  CheckSquare, Palette, PackageSearch, FileBarChart2, MessageSquare,
  Ticket, Bell, Settings, ChevronRight, Layers, LogOut, Star
} from 'lucide-react'

const nav = [
  { label: 'Dashboard',    icon: LayoutDashboard,  to: '/' },
  { label: 'Projects',     icon: FolderKanban,     to: '/projects' },
  { label: 'Clients',      icon: Users,            to: '/clients' },
  { label: 'Workers',      icon: HardHat,          to: '/workers' },
  { label: 'Tasks',        icon: CheckSquare,      to: '/tasks' },
  { label: 'Approvals',    icon: Star,             to: '/approvals' },
  { label: 'Payments',     icon: CreditCard,       to: '/payments' },
  { label: 'Designs',      icon: Palette,          to: '/designs' },
  { label: 'Materials',    icon: Layers,           to: '/materials' },
  { label: 'Templates',    icon: PackageSearch,    to: '/templates' },
  { label: 'Reports',      icon: FileBarChart2,    to: '/reports' },
  { label: 'Messages',     icon: MessageSquare,    to: '/messages' },
  { label: 'Tickets',      icon: Ticket,           to: '/tickets' },
  { label: 'Notifications',icon: Bell,             to: '/notifications' },
  { label: 'Settings',     icon: Settings,         to: '/settings' },
]

export default function Sidebar({ collapsed }) {
  return (
    <aside
      style={{ width: collapsed ? 64 : 230, background: 'var(--sidebar-bg)', transition: 'width 0.25s ease' }}
      className="flex flex-col h-screen flex-shrink-0 overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #883bbc, #f3a9de)' }}>
          <span className="text-white font-black text-sm">G</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-white font-bold text-sm leading-none">GatiVidhi</div>
            <div className="text-white/40 text-xs mt-0.5">Admin Console</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll py-3 px-2">
        {!collapsed && (
          <div className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-2 mb-2">
            Main Menu
          </div>
        )}
        {nav.slice(0, 5).map(({ label, icon: Icon, to }) => (
          <SidebarItem key={to} label={label} Icon={Icon} to={to} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <div className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-2 mt-5 mb-2">
            Management
          </div>
        )}
        {nav.slice(5, 11).map(({ label, icon: Icon, to }) => (
          <SidebarItem key={to} label={label} Icon={Icon} to={to} collapsed={collapsed} />
        ))}

        {!collapsed && (
          <div className="text-white/25 text-[10px] font-semibold uppercase tracking-widest px-2 mt-5 mb-2">
            Support & Config
          </div>
        )}
        {nav.slice(11).map(({ label, icon: Icon, to }) => (
          <SidebarItem key={to} label={label} Icon={Icon} to={to} collapsed={collapsed} />
        ))}
      </nav>

      {/* Admin profile */}
      <div className="border-t border-white/5 p-3">
        {collapsed ? (
          <div className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #883bbc, #f3a9de)' }}>
            <span className="text-white font-bold text-xs">A</span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #883bbc, #f3a9de)' }}>
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-semibold truncate">Admin</div>
              <div className="text-white/40 text-[10px] truncate">admin@gatividhi.com</div>
            </div>
            <button className="text-white/30 hover:text-white/70 transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function SidebarItem({ label, Icon, to, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `sidebar-item flex items-center gap-3 px-2 py-2 rounded-lg mb-0.5 group relative
        ${isActive
          ? 'text-white'
          : 'text-white/45 hover:text-white/80 hover:bg-white/5'}`
      }
      style={({ isActive }) => isActive ? { background: 'rgba(136,59,188,0.35)' } : {}}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
              style={{ background: '#f3a9de' }} />
          )}
          <Icon size={16} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
          {!collapsed && isActive && (
            <ChevronRight size={12} className="ml-auto opacity-60" />
          )}
          {collapsed && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md
              opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  )
}
