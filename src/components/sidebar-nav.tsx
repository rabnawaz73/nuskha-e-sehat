'use client';

import {
  Mic,
  Scan,
  Store,
  Home,
  BookOpen,
  AlertCircle,
  CookingPot,
  Waves,
  ShieldCheck,
  Users,
  BrainCircuit,
  Settings,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const links = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/dashboard/assistant', label: 'AI Voice Assistant', icon: Mic },
  { href: '/dashboard/scan', label: 'Scan Medicine', icon: Scan },
  { href: '/dashboard/debate', label: 'AI Debate', icon: Users },
  { href: '/dashboard/cough-detector', label: 'Cough Detector', icon: Waves },
  { href: '/dashboard/safety-check', label: 'Safety Check', icon: ShieldCheck },
  { href: '/dashboard/food-guide', label: 'Food Guide', icon: CookingPot },
  { href: '/dashboard/mood-tracker', label: 'Mood Tracker', icon: BrainCircuit },
  { href: '/dashboard/pharmacies', label: 'Find Pharmacies', icon: Store },
  { href: '/dashboard/learn', label: 'Learn', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
  { href: '/dashboard/emergency', label: 'Emergency Help', icon: AlertCircle },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {links.map((link) => (
        <SidebarMenuItem key={link.href}>
          <Link href={link.href} passHref>
            <SidebarMenuButton
              asChild={false}
              isActive={pathname === link.href}
              tooltip={link.label}
            >
              <link.icon />
              <span>{link.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
