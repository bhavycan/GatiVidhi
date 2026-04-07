import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, FolderKanban, Users, HardHat, CreditCard,
  CheckSquare, Palette, PackageSearch, FileBarChart2, MessageSquare,
  Ticket, Bell, Settings, Layers, LogOut, Star
} from 'lucide-react'

const mainNav = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: '/' },
  { label: 'Projects',   icon: FolderKanban,    to: '/projects' },
  { label: 'Clients',    icon: Users,           to: '/clients' },
  { label: 'Workers',    icon: HardHat,         to: '/workers' },
  { label: 'Tasks',      icon: CheckSquare,     to: '/tasks' },
]

const mgmtNav = [
  { label: 'Approvals',  icon: Star,            to: '/approvals' },
  { label: 'Payments',   icon: CreditCard,      to: '/payments' },
  { label: 'Designs',    icon: Palette,         to: '/designs' },
  { label: 'Materials',  icon: Layers,          to: '/materials' },
  { label: 'Templates',  icon: PackageSearch,   to: '/templates' },
  { label: 'Reports',    icon: FileBarChart2,   to: '/reports' },
]

const supportNav = [
  { label: 'Messages',      icon: MessageSquare, to: '/messages' },
  { label: 'Tickets',       icon: Ticket,        to: '/tickets' },
  { label: 'Notifications', icon: Bell,          to: '/notifications' },
  { label: 'Settings',      icon: Settings,      to: '/settings' },
]

export default function Sidebar({ collapsed, notifCount = 0, msgCount = 0 }) {
  return (
    <aside
      style={{
        width: collapsed ? 68 : 240,
        transition: 'width 0.25s ease',
        background: 'linear-gradient(160deg, #F7D6F3 0%, #ede4fa 50%, #e8dff8 100%)',
        borderRight: '1px solid rgba(136,59,188,0.12)',
        boxShadow: '2px 0 16px rgba(136,59,188,0.08)',
      }}
      className="flex flex-col h-screen flex-shrink-0 overflow-hidden relative"
    >
      {/* Decorative blur blobs */}
      <div className="absolute top-[-40px] right-[-30px] w-40 h-40 rounded-full pointer-events-none"
        style={{ background: 'rgba(248,209,243,0.6)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-20 left-[-20px] w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'rgba(183,148,230,0.3)', filter: 'blur(35px)' }} />

      {/* Logo / Title */}
      <div className="relative px-4 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(136,59,188,0.12)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, var(--purple), #f3a9de)', boxShadow: '0 4px 14px rgba(136,59,188,0.35)' }}>
            <span className="text-white font-black text-sm">G</span>
          </div>
          {!collapsed && (
            <div>
              <div className="text-xl font-semibold leading-none" style={{ color: '#1e1e2e' }}>GatiVidhi</div>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.6)', color: 'var(--purple)' }}>
                Admin!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-0.5">
        <SectionLabel label="Main" collapsed={collapsed} />
        {mainNav.map((item, i) => (
          <SidebarItem key={item.to} item={item} collapsed={collapsed} delay={i * 0.04} />
        ))}

        <div className="pt-3">
          <SectionLabel label="Management" collapsed={collapsed} />
          {mgmtNav.map((item, i) => (
            <SidebarItem key={item.to} item={item} collapsed={collapsed} delay={i * 0.04} />
          ))}
        </div>

        <div className="pt-3">
          <SectionLabel label="Support" collapsed={collapsed} />
          {supportNav.map((item, i) => (
            <SidebarItem
              key={item.to}
              item={item}
              collapsed={collapsed}
              delay={i * 0.04}
              badge={
                item.to === '/notifications' && notifCount > 0 ? notifCount :
                item.to === '/messages' && msgCount > 0 ? msgCount : 0
              }
            />
          ))}
        </div>
      </nav>

      {/* Admin footer */}
      <div className="relative px-3 py-3" style={{ borderTop: '1px solid rgba(136,59,188,0.12)' }}>
        {collapsed ? (
          <div className="w-9 h-9 rounded-full mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, var(--purple), #f3a9de)' }}>
            <span className="text-white font-bold text-xs">A</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--purple), #f3a9de)' }}>
              <span className="text-white font-bold text-xs">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold truncate" style={{ color: '#1e1e2e' }}>Admin</div>
              <div className="text-[10px] truncate" style={{ color: 'var(--purple)' }}>Super Admin</div>
            </div>
            <button className="p-1 rounded-lg hover:bg-red-100 transition-colors"
              style={{ color: '#bb7bca' }}>
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function SectionLabel({ label, collapsed }) {
  if (collapsed) return <div className="my-2 mx-1 h-px" style={{ background: 'rgba(136,59,188,0.15)' }} />
  return (
    <div className="text-[11px] font-bold px-2 pb-1.5 pt-1" style={{ color: 'var(--purple)', opacity: 0.6 }}>
      {label}:
    </div>
  )
}

function SidebarItem({ item: { label, icon: Icon, to }, collapsed, delay, badge = 0 }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
    >
      {({ isActive }) => (
        <motion.div
          initial={false}
          whileHover={{ x: 4, transition: { type: 'spring', stiffness: 400, damping: 20 } }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 cursor-pointer relative overflow-hidden"
          style={{
            background: isActive ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.35)',
            backdropFilter: 'blur(6px)',
            boxShadow: isActive ? '0 2px 12px rgba(136,59,188,0.15)' : 'none',
            border: isActive ? '1px solid rgba(136,59,188,0.2)' : '1px solid transparent',
            transition: 'background 0.15s ease, box-shadow 0.15s ease',
          }}
        >
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
              style={{ background: 'linear-gradient(180deg, var(--purple), #f3a9de)' }} />
          )}
          <div className="relative flex-shrink-0">
            <Icon
              size={16}
              style={{ color: isActive ? 'var(--purple)' : '#a070c0' }}
            />
            {collapsed && badge > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>
          {!collapsed && (
            <span className="text-sm font-bold truncate flex-1"
              style={{ color: isActive ? 'var(--purple)' : '#3d1f5c' }}>
              {label}
            </span>
          )}
          {!collapsed && badge > 0 && (
            <span className="ml-auto shrink-0 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
          {collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -4 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute left-full ml-3 px-2.5 py-1.5 text-white text-xs font-bold rounded-xl
                pointer-events-none whitespace-nowrap z-50"
              style={{ background: 'linear-gradient(135deg, var(--purple), var(--purple-light))', boxShadow: '0 4px 12px rgba(136,59,188,0.3)' }}
            >
              {label}
            </motion.div>
          )}
        </motion.div>
      )}
    </NavLink>
  )
}
